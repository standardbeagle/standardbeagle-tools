---
name: mcp-architect-citation-verification-pattern
description: "4-layer response shape for MCP tools emitting source-linked claims — source-exists, claim-derivable, no-over-extension, no-hallucinated-cite. For research/synthesis/doc-generation/claim-emitting servers. Use when: MCP tool returning sourced facts, summaries, citations, retrieved snippets; readers follow links from tool output; reviewing tool with URLs/file paths/memory IDs as evidence. Skip: pure retrieval without claims, structural tools (list/count), output never asserts truth."
disable-model-invocation: true
version: 0.1.0
---

# Citation Verification Pattern

## Purpose

Define the response shape for MCP tools whose answers carry citations to sources. The pattern decomposes "this claim is properly cited" into four named, separately-checkable layers so server authors can validate each layer at design time and so consumers can audit which layer failed when something goes wrong.

The pattern is design guidance for MCP server authors. It is not a runtime validator. The knowledge-hygiene plugin's `multi-source-research` skill and `conflict-detector` agent are the runtime side; this skill is the design side that informs how the server *shapes* the response those runtime tools will consume.

## When to Apply

Apply this pattern when designing or auditing tools that:

- Emit claims linked to a source — research summarizers, doc-generation tools, retrieval-augmented answer tools, memory-recall tools, fact-check tools, "explain this code" tools that cite source files.
- Return structured output that downstream agents will treat as evidence ("the README says X", "line 42 confirms Y").
- Will be invoked by agents that themselves will cite the tool's output in higher-level claims (citation propagation — a hallucinated cite at this layer corrupts the chain above).

Skip this pattern when:

- The tool returns raw matches without interpretation (e.g., a grep tool returning file:line hits — the cite is the result itself, no claim layer).
- The tool returns structural facts that are self-evidently checkable (e.g., a tool that returns a file's line count — the file is the source and the source is the answer).
- The tool's output is purely generative with no source attribution (e.g., a code-formatter — there is no "source said so" claim to verify).

## The 4 Layers

Each layer is a separate property of a well-cited response. A failure at any layer invalidates the cite, but the failures are categorically distinct, so the pattern names them so server authors can think about them one at a time.

### Layer 1 — Source exists

The cite points to a real, resolvable artifact. The artifact must be one of the K2 §3.1 provenance value forms (see `docs/research/K2-knowledge-hygiene-from-papers.md`):

- `file:<path>:<line>` — file at path exists, line is in range
- `memory:<id>` — memory entry with that id exists in the addressed store
- `git:<sha>` — sha resolves in the repo
- `web:<url>` — URL is well-formed and reachable (verify-by-fetch covered in Layer 4)
- literal string `"guess"` — the claim is unverified and the tool surfaces this honestly rather than inventing a cite

Empty / null / missing provenance is rejected. If the claim is genuinely unverified, the tool emits the literal `"guess"` value so downstream consumers can audit "what is unverified?"

This layer mirrors the OmniMEM 4-layer architecture (paper `2604.01007`) — every layer of memory carries layer-attribution; here, every claim carries source-attribution.

### Layer 2 — Claim is derivable from source

The source content actually supports the claim. The tool's response should let a verifier check this without re-running the model.

Concrete shape: each cited claim carries a quoted excerpt or pointer to the exact span of the source that supports it. The excerpt is short (one sentence, one snippet, one record) and verbatim — paraphrase is the failure mode this layer guards against.

```jsonc
{
  "claim": "The cache TTL defaults to 60 seconds.",
  "source": "file:src/cache/config.ts:42",
  "evidence": "const DEFAULT_TTL_SECONDS = 60;"
}
```

The verifier can open `src/cache/config.ts` line 42 and confirm the line literally contains `DEFAULT_TTL_SECONDS = 60`. If the line says `DEFAULT_TTL_SECONDS = 600`, Layer 2 fails — the source exists (Layer 1 passed) but the claim is not derivable from it.

### Layer 3 — No over-extension

The claim does not generalize beyond what the source establishes. This is the failure mode where the source supports a narrow assertion ("the TTL is 60s in this config file") but the tool's claim generalizes ("the TTL is always 60s").

Concrete shape: the claim's scope is bounded by the source's scope. If the source is a single file, the claim should not be universal. If the source is a single test run, the claim should not be steady-state. If the source is one user's comment, the claim should not be "users agree."

Server authors should prefer scoped claim language in tool output ("in this file", "as of this commit", "according to this RFC") rather than ambient-present-tense generalizations. Temporal normalization (K2 §3.6) is a special case of this layer for date-bearing claims.

### Layer 4 — No hallucinated cite (verify-by-fetch)

The cite resolves. For `file:<path>:<line>`, the file exists and the line is in range. For `web:<url>`, the URL fetches. For `memory:<id>`, the id is present in the store. For `git:<sha>`, the sha is in the repo.

This layer is verify-by-fetch — the tool actively confirms the cite resolves before emitting it, rather than synthesizing a plausible-looking path or URL. Tools that compose responses across multiple sources should perform the resolution check in the tool's own boundary, not push it to the consumer.

Failure mode this prevents: the tool invents a path like `src/utils/helpers.ts:127` that looks reasonable but does not exist in the repo. Layer 1's "source exists" check is the *contract* — Layer 4 is the *verification step the tool performs* to honor that contract.

## Pattern Shape

A well-cited response from a claim-emitting MCP tool default toward this envelope:

```jsonc
{
  "claims": [
    {
      "claim": "<the assertion>",
      "source": "<provenance value: file:path:line | memory:id | git:sha | web:url | \"guess\">",
      "evidence": "<short verbatim excerpt or pointer>",
      "scope": "<optional: 'file' | 'commit' | 'as-of <date>' | 'context-bounded'>",
      "confidence": "<high | med | low>"
    }
  ],
  "unverified": [
    "<list of claims where source = \"guess\"; surfaced rather than hidden>"
  ]
}
```

The `unverified` field is the honest-guess channel — claims the tool could not source go here, not into `claims[]` with a fabricated cite.

## Worked Example

A research-summarizer MCP tool answers "what is the OmniMEM 4-layer architecture?":

```jsonc
{
  "claims": [
    {
      "claim": "OmniMEM proposes 4 memory layers: short-term, episodic, semantic, procedural.",
      "source": "web:https://arxiv.org/abs/2604.01007",
      "evidence": "Section 3.1: 'We organize memory into four layers — short-term, episodic, semantic, and procedural — each with distinct retrieval characteristics.'",
      "scope": "as-of paper publication",
      "confidence": "high"
    },
    {
      "claim": "OmniMEM's architecture is the basis for the K2 4-layer-cite-trail pattern.",
      "source": "file:docs/research/K2-knowledge-hygiene-from-papers.md:101",
      "evidence": "OmniMEM (2604.01007) 4-layer architecture (architecture > HP finding implies storage layers must be inspectable)",
      "scope": "this repo, K2 design doc",
      "confidence": "high"
    }
  ],
  "unverified": []
}
```

Each claim passes all four layers: sources resolve (Layer 1, Layer 4), evidence quotes the exact span (Layer 2), scope qualifiers prevent over-extension (Layer 3).

## Anti-Patterns

### Anti-pattern: Plausible-looking but invented cite

```jsonc
{
  "claim": "The cache TTL is 60 seconds.",
  "source": "file:src/cache/config.ts:42"
  // ...but src/cache/config.ts:42 does not contain a TTL definition;
  // the tool synthesized a plausible-looking path
}
```

Why bad: Layer 4 fails. The cite looks credible to a reader skimming the response but does not resolve. This is the most damaging failure mode because it actively misleads.

### Anti-pattern: Paraphrased evidence

```jsonc
{
  "claim": "The cache TTL is 60 seconds.",
  "source": "file:src/cache/config.ts:42",
  "evidence": "TTL is set to one minute"
  // ...but the actual line says `DEFAULT_TTL_SECONDS = 60`;
  // the evidence is a paraphrase, not a quote
}
```

Why bad: Layer 2 fails subtly. The evidence supports the claim, but a verifier cannot do a string-match against the source — they must re-interpret. Paraphrase opens the door to the rationalization-trap (K2 §3.3) where the paraphrase silently bends the source to fit the claim.

### Anti-pattern: Universal claim from local source

```jsonc
{
  "claim": "Cache TTL in this codebase is always 60 seconds.",
  "source": "file:src/cache/config.ts:42",
  "evidence": "const DEFAULT_TTL_SECONDS = 60;"
}
```

Why bad: Layer 3 fails. The source establishes the *default* TTL in *one* file. The claim generalizes to "always" and "this codebase". A verifier checking only the cited line cannot disprove the universal claim; they have to grep the whole repo. The claim should be scoped: "The default cache TTL in `src/cache/config.ts` is 60 seconds."

### Anti-pattern: Dropped unverified claims

```jsonc
{
  "claims": [
    { "claim": "A is true.", "source": "file:a.ts:1", "evidence": "..." }
    // ... but the user also asked about B; tool could not source B;
    // tool silently dropped the B claim from the response
  ]
}
```

Why bad: this is the silent-elision failure. The tool should put the B claim in `unverified[]` so the consumer knows B was asked but not answerable, rather than acting like B was never asked. Honest "I don't know" beats invisible "I dropped it."

## Cross-Plugin Notes

This skill defines the **emit-side design pattern**. The runtime consumers are:

- `knowledge-hygiene:multi-source-research` skill — gathers sources for a query and synthesizes a response. Should produce output matching this pattern's envelope.
- `knowledge-hygiene:conflict-detector` agent — processes 2+ sources for contradictions. Sources passed to the conflict-detector should themselves carry Layer-1 provenance and Layer-2 evidence.
- See also `mcp-architect:conflict-aware-response` — the response shape when sources disagree.
- See also `mcp-architect:progressive-discovery` — when claims are emitted across progressive layers, each layer's claims must independently satisfy this pattern.

## Citations

- **K2 design doc:** `docs/research/K2-knowledge-hygiene-from-papers.md` §3.1 (Provenance per claim — 4-layer cite trail). Defines the 5 provenance value forms used at Layer 1.
- **OmniMEM:** arxiv `2604.01007` — 4-layer memory architecture. The pattern's 4-layer decomposition is the citation-side analog of OmniMEM's storage-side 4 layers.
- **K2 §3.3 (rationalization-trap):** the value-rule that paraphrase / silent-rewrite / silent-elision are forbidden. This skill's Layers 2, 3, and the unverified-channel mechanic operationalize that rule for citation emission.

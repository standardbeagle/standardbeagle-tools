---
description: "Response schema for MCP tools that consume 2+ sources — surface disagreement structurally rather than silently picking a winner. The conflicts[] field is present only when sources actually disagree (no false-positive bloat). Mirrors knowledge-hygiene:conflict-detector output shape so emit-side and consume-side speak the same wire format. Use when: designing an MCP tool that synthesizes across multiple sources (research synthesis, multi-doc Q&A, cross-reference lookup, multi-source memory recall), a tool that answers using 2+ retrieved snippets, or a tool whose output a downstream conflict-detector will inspect. Do not use for: single-source tools, tools where source independence is not a property of the design (e.g., a single file's content), or pure aggregation tools where 'disagree' is undefined."
version: 0.1.0
---

# Conflict-Aware Response

## Purpose

Define the response shape for MCP tools that synthesize across two or more sources, so contradictions are surfaced as structured output rather than papered over by a silent pick.

The pattern is design guidance for MCP server authors. The runtime detector is `knowledge-hygiene:conflict-detector` (commit `b28aa0f`); this skill specifies the response envelope so a tool's output is **directly inspectable** by that detector and so consumers can reason about disagreement without re-running the synthesis.

The only value-rule in this pattern (and one of the few in K2 overall) is: **the tool must not silently pick a winner when sources disagree.** Everything else is preference.

## When to Apply

Apply when designing or auditing tools that:

- Take 2+ sources as input (or compose results from 2+ retrieval calls internally) and return a synthesized answer.
- Will be consumed by agents that themselves cite the synthesis as evidence.
- Operate over sources with independent provenance — different files, different URLs, different memory entries, different commits.

Skip when:

- The tool returns from a single source (no disagreement is possible).
- The tool returns raw multi-source results without synthesis (the consumer does the picking; the tool does not).
- "Sources" are not independent (e.g., 5 lines of the same file — not a multi-source case).

## Pattern Shape

The response envelope:

```jsonc
{
  "answer": "<the synthesized response>",
  "sources": [
    {
      "id": "<stable identifier — file path, URL, memory id>",
      "source_text": "<the cited excerpt>",
      "provenance": "<file:path:line | memory:id | git:sha | web:url | \"guess\">",
      "confidence": "<high | med | low>"
    }
  ],
  "conflicts": [  // Present only when sources disagree. Empty / omitted when no conflict.
    {
      "conflict_type": "<direct-contradiction | numeric-mismatch | temporal-mismatch | scope-mismatch>",
      "sources": ["<id of source A>", "<id of source B>", "..."],
      "recommended_resolution": "<prefer-recent | prefer-authoritative | escalate-to-user>",
      "reasoning": "<one or two sentences explaining the disagreement and the resolution choice>"
    }
  ]
}
```

The `conflicts[]` field is **omitted or empty when there is no conflict** — adding an empty array on every response would dilute the signal and train consumers to ignore it. Surface only when there is something to surface.

The schema mirrors the output of `knowledge-hygiene:conflict-detector` (commit `b28aa0f`) so a synthesizing tool can route its sources through the detector and embed the detector's verdict directly in this response without reshaping.

## The Four Conflict Types

These are the categories the runtime conflict-detector recognizes; a synthesizing tool's `conflict_type` field should match this vocabulary so consumers can dispatch on it:

- **`direct-contradiction`** — mutually exclusive assertions ("X is true" vs "X is false").
- **`numeric-mismatch`** — different numbers for the same quantity ("TTL = 60s" vs "TTL = 300s").
- **`temporal-mismatch`** — different dates / versions / sequence orderings for the same event.
- **`scope-mismatch`** — one source claims universally while another scopes narrowly ("always" vs "only on Linux").

A "no conflict" finding is the absence of a `conflicts[]` entry, not a `conflict_type: "none"` row. This matches the no-false-positive-bloat preference.

## The Three Recommended Resolutions

When a conflict is surfaced, the tool defaults toward one of these named resolutions. The choice is driven by source metadata, not by the tool's opinion:

- **`prefer-recent`** — when sources have a clear temporal ordering (newer commit, newer retrieved-at, explicit version numbers) AND no other signal favors the older source. Default for documentation drift.
- **`prefer-authoritative`** — when one source is materially more authoritative for the entity in question:
  - `file:<path>:<line>` in the codebase beats `web:<url>` for behavioral claims about that codebase.
  - Spec / RFC / official docs beat blog posts for protocol claims.
  - Provenance with `confidence: high` beats provenance with `confidence: low | guess`.
- **`escalate-to-user`** — when neither recency nor authority cleanly dominates, OR when the contradiction touches a value-layer concern (security, data integrity, breaking changes). The tool does NOT silently pick in these cases.

These three names match the conflict-detector agent's vocabulary exactly so the wire format flows end-to-end without translation.

## The No-Silent-Pick Value Rule

This is the only "must" in this skill. Everything else is preference.

**A tool that detects disagreement across its sources MUST surface the disagreement in the response. It MUST NOT silently pick a winner.**

Operationally, this means:

- If two sources disagree and the tool's answer reflects only one of them, the `conflicts[]` array MUST contain an entry naming the disagreement.
- If the resolution is genuinely ambiguous, `recommended_resolution` is `escalate-to-user` — not a hidden pick.
- The `answer` field may still commit to one resolution (clients want a usable answer), but the `conflicts[]` entry makes the choice visible and auditable.

This rule is the operational form of K2 §3.3 (rationalization-trap, the value-layer rule). Silent picking is the rationalization-trap at design time — the tool decides which source to believe, then writes a fluent answer that hides the decision.

## Worked Example — Conflict Present

Two sources disagree on a cache TTL. The tool surfaces the conflict:

```jsonc
{
  "answer": "The cache TTL is 60 seconds (per src/cache/config.ts), though the README documents it as 300 seconds.",
  "sources": [
    {
      "id": "src/cache/config.ts:42",
      "source_text": "const DEFAULT_TTL_SECONDS = 60;",
      "provenance": "file:src/cache/config.ts:42",
      "confidence": "high"
    },
    {
      "id": "README.md:128",
      "source_text": "Cache entries expire after 300 seconds by default.",
      "provenance": "file:README.md:128",
      "confidence": "high"
    }
  ],
  "conflicts": [
    {
      "conflict_type": "numeric-mismatch",
      "sources": ["src/cache/config.ts:42", "README.md:128"],
      "recommended_resolution": "prefer-authoritative",
      "reasoning": "Behavioral claim about this codebase; the source file beats README documentation drift. README likely stale."
    }
  ]
}
```

The user gets a usable answer (the `answer` field commits to 60s) **and** sees that the README disagrees, so they can decide whether to fix the README.

## Worked Example — No Conflict

Same tool, same shape, no disagreement found:

```jsonc
{
  "answer": "OmniMEM proposes a 4-layer memory architecture: short-term, episodic, semantic, procedural.",
  "sources": [
    {
      "id": "arxiv:2604.01007",
      "source_text": "We organize memory into four layers...",
      "provenance": "web:https://arxiv.org/abs/2604.01007",
      "confidence": "high"
    },
    {
      "id": "K2:101",
      "source_text": "OmniMEM (2604.01007) 4-layer architecture",
      "provenance": "file:docs/research/K2-knowledge-hygiene-from-papers.md:101",
      "confidence": "high"
    }
  ]
  // conflicts[] omitted — sources agree.
}
```

Note `conflicts[]` is **absent**, not present-and-empty. Consumers can use the existence of the key as a fast signal.

## Anti-Patterns

### Anti-pattern: Silent pick

```jsonc
{
  "answer": "The cache TTL is 60 seconds.",
  "sources": [
    {"id": "src/cache/config.ts:42", "source_text": "const DEFAULT_TTL_SECONDS = 60;", ...},
    {"id": "README.md:128", "source_text": "Cache entries expire after 300 seconds by default.", ...}
  ]
  // conflicts[] omitted; the tool internally decided config.ts wins
  // and didn't tell the consumer that README disagreed
}
```

Why bad: violates the only value-rule in this skill. The consumer sees one answer with two supporting sources and concludes the sources agree. They do not. The tool's silent pick has rewritten the apparent state of the world.

### Anti-pattern: False-positive bloat

```jsonc
{
  "answer": "...",
  "sources": [...],
  "conflicts": []  // Always present, always empty when no conflict
}
```

Why bad: trains consumers to ignore the `conflicts[]` field. When a real conflict appears, the field looks like background noise. Omit when empty so the field carries signal when present.

### Anti-pattern: Conflict surfaced, answer hidden

```jsonc
{
  "answer": "Sources disagree on cache TTL — see conflicts[].",
  "sources": [...],
  "conflicts": [...]
}
```

Why bad: this is the over-correction. The user asked a question; "go look at conflicts[]" is not a usable answer. Commit to a resolution in `answer` AND surface the conflict — both, not either.

### Anti-pattern: Wrong vocabulary

```jsonc
{
  "conflicts": [
    {
      "conflict_type": "disagreement",  // not in the four named types
      "recommended_resolution": "use the better one"  // not in the three named resolutions
    }
  ]
}
```

Why bad: breaks the wire format with `knowledge-hygiene:conflict-detector`. Consumers that dispatch on the typed vocabulary cannot route this; they fall back to string-matching, which silently fails. Default toward the four-type and three-resolution vocabulary even when a freer-form description seems more natural.

## Cross-Plugin Notes

This skill is the **emit-side response shape**. The runtime side is `knowledge-hygiene:conflict-detector` (commit `b28aa0f`), which produces output in this same shape. The two plugins share a single wire format on purpose.

- `mcp-architect:citation-verification-pattern` — every source in the `sources[]` array should also satisfy the 4-layer citation pattern. Conflict-aware-response handles the *across-source* discipline; citation-verification handles the *per-source* discipline.
- `mcp-architect:progressive-discovery` — when conflicts span progressive disclosure layers, surface the conflict at the layer where both sources are visible (typically the synthesis layer, not the per-layer raw output).
- K2 §3.3 (rationalization-trap value-rule) — the silent-pick anti-pattern is the design-time form of the rationalization-trap. This skill operationalizes that rule for multi-source response design.

## Citations

- **K2 design doc:** `docs/research/K2-knowledge-hygiene-from-papers.md` §3.2 (Conflict surfacing across sources). Source for the response-must-emit-visible-output rule.
- **K2 §3.3** (rationalization-trap, the only value-rule). The no-silent-pick rule above is the design-time form of K2's value-rule.
- **ConflictQA + XoT:** arxiv `2604.11209` §3 (cross-source knowledge conflict detection mechanism). Source for the four conflict types and the surface-then-reason mechanic.
- **knowledge-hygiene:conflict-detector** agent (commit `b28aa0f`) — the runtime consumer this response shape is wire-compatible with.

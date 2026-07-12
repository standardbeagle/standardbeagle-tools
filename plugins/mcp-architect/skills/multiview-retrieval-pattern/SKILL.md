---
name: mcp-architect-multiview-retrieval-pattern
description: "Retrieval MCP progressive disclosure: default single mode; dense/lexical/symbolic/multiview opt-in flags. Index-once query-many. Use when: retrieval MCP over corpus with multiple index types (semantic + lexical + symbolic + graph), tool hitting recall cliff on multi-hop, consumers want opt-in expensive merges. Skip: single-corpus single-mode tools, all-1-hop queries, generative tools."
disable-model-invocation: true
version: 0.1.0
---

# Multiview Retrieval Pattern

## Purpose

Define the tool-design pattern for MCP retrieval servers that benefit from multiple index types. The pattern is: build all indices once, expose each as a named retrieval mode, default to the cheapest mode, and let consumers opt into more expensive merged modes via a flag rather than paying that cost on every call.

The pattern is design guidance for MCP server authors. The reference implementation is the lci `--mode` spec at `plugins/lci/docs/lci-modes-spec.md` (commit `2a649e0`); this skill generalizes the lci-specific shape into a pattern other retrieval-tool authors can apply.

## When to Apply

Apply when designing or auditing tools that:

- Retrieve over a corpus that supports multiple complementary index types — semantic embeddings, BM25 / lexical, symbolic / metadata, knowledge-graph.
- Have users who run a mix of 1-hop semantic queries and multi-hop cross-cutting queries.
- Pay a one-time index-build cost that is shared across modes (the *index-once* half of the amortization argument).
- Have consumers (agents, other tools) that can reason about which mode to invoke — i.e., a flag is a usable interface, not a leaky abstraction.

Skip when:

- Only one index type exists or only one is meaningful for the corpus (e.g., a tool over a single text blob — bm25 and dense overlap totally).
- The query mix is uniformly 1-hop (multiview's lift is task-dependent — RAGSearch's main finding — so no-multi-hop means no-multiview-payoff).
- The tool serves human end-users who will not learn the flag (then default toward a single mode and let server-side heuristics route).

## Pattern Shape

### Mode taxonomy

Four named modes, in order from cheapest to most expensive:

| Mode | Index | Coverage class | Query cost | Default? |
|---|---|---|---|---|
| `dense` | embeddings | paraphrase-tolerant semantic | sub-ms ANN | yes |
| `bm25` | lexical inverted | exact-match / known keyword | sub-ms exact | no |
| `symbolic` | metadata-only | structural enumeration | sub-ms filter | no |
| `multiview` | all three + graph | multi-hop / cross-cutting | higher; merges N streams | no (opt-in) |

Names match the lci spec exactly so consumers that learn one retrieval tool's vocabulary can carry it across servers.

### Tool input shape

```jsonc
{
  "query": "string",
  "mode": "dense" | "bm25" | "symbolic" | "multiview",  // optional; default "dense"
  // ...all other tool-specific parameters (filter, limit, etc.)
}
```

- `mode` is optional; omission behaves identically to `mode: "dense"` (back-compat).
- Unrecognized `mode` value: tool SHOULD fail fast with a structured error naming the four valid modes (per the project rule "fail fast, report errors, never fallback data"). MUST NOT silently fall back to `dense`.

### Tool output shape

The tool returns its existing result envelope plus per-result mode-attribution fields:

```jsonc
{
  "results": [
    {
      // ... existing fields (id, file, line, snippet, etc.)
      "mode_source": "dense" | "bm25" | "symbolic",  // which sub-index produced this hit
      "mode_score": 0.87,                            // mode-native score
      "also_matched": [                              // multiview only
        {"mode": "bm25", "score": 0.62}
      ]
    }
  ]
}
```

`mode_source` lets consumers attribute provenance per result (this is the K2 §3.1 provenance discipline applied to the retrieval surface itself — every result carries layer-attribution). `also_matched` (multiview-only) lets consumers reason about agreement: a result that matched in 3 of 3 sub-indices is more trustworthy than one that matched in 1 of 3.

## Index-Once, Query-Many

The economic argument for this pattern.

**Build cost** — paid once per corpus version:
- Embedding index: walk corpus, embed each chunk, store ANN structure.
- BM25 index: walk corpus, tokenize, build inverted index.
- Symbolic index: walk corpus, extract metadata (file path, language, symbol kind).
- Graph index (for multiview): build call-hierarchy / dependency edges.

These builds share corpus-walk and chunking work — the marginal cost of adding a second index is far less than the cost of building the first.

**Query cost** — paid per call, per mode:
- `dense`: sub-ms ANN lookup
- `bm25`: sub-ms inverted-index lookup
- `symbolic`: sub-ms filter
- `multiview`: parallel dispatch across the above + graph; merges N streams

The "many" half is the consumer-side discipline: a tool that exposes all four modes lets each query pick the cheapest mode that satisfies its semantics. Multi-hop queries opt into multiview; everything else stays cheap. The expensive merge is paid only when a query actually benefits from it.

This is the design-time form of K2 §3.5 (complexity-aware pruning) — cheap queries get cheap routes, expensive queries get expensive routes, routing is explicit. RAGSearch's task-dependent lift finding (paper `2604.09666`) is the empirical justification: complex multi-hop queries benefit from merged retrieval; simple 1-hop queries do not, and routing them through multiview pays latency for no quality gain.

## Layered Output (Progressive Disclosure)

Multiview retrieval composes naturally with progressive disclosure (see `mcp-architect:progressive-discovery`). The tool returns one layer by default; richer layers are opt-in.

**Layer 1 — default** (mode = `dense` or whatever the cheapest sensible default is):
```
results: [{ id, file, line, snippet }, ...]
```
Tight envelope, sub-ms cost, satisfies most queries.

**Layer 2 — explicit mode** (mode = `bm25` | `symbolic`):
```
results: [{ id, file, line, snippet, mode_source, mode_score }, ...]
```
Same envelope, different index — consumer asked for it explicitly.

**Layer 3 — multiview** (mode = `multiview`):
```
results: [{ id, file, line, snippet, mode_source, mode_score, also_matched: [...] }, ...]
```
Richer per-result data; higher cost; opt-in only.

Consumers that learn the tool incrementally pay no cost for layers they never query. The tool design separates *index build* (eager, all modes) from *query exposure* (lazy, per-call).

## Worked Example — lci search modes

Concrete reference: `plugins/lci/docs/lci-modes-spec.md` (commit `2a649e0`) realizes this pattern for code search:

- `dense` — current `0.4.0` behavior; embedding retrieval over indexed symbols. Default.
- `bm25` — reserved surface; lexical retrieval for exact-match queries (function names, error strings, log lines).
- `symbolic` — reserved surface; metadata-only retrieval for structural queries ("list all interfaces in `src/api/**`").
- `multiview` — reserved surface; parallel dispatch + call-hierarchy + dependency graph for multi-hop queries.

The lci spec also wires in `--conflicts` orthogonal to mode (any mode + conflict surfacing) — the multiview pattern composes with `mcp-architect:conflict-aware-response`. See lci spec §1 for the full mode definitions and §2-3 for the input/output shapes this pattern generalizes.

## Anti-Patterns

### Anti-pattern: Default to multiview

A tool that runs multiview on every call to "be thorough" pays the merge cost on every query, including the 1-hop queries that gain nothing from it. RAGSearch's finding is precisely that the lift is task-dependent — defaulting to the expensive route is the bloat K2 §3.5 calls out.

Why bad: latency / cost on every call; no quality gain on simple queries.

### Anti-pattern: Silent fallback on unknown mode

```jsonc
{ "mode": "nonsense" }
// Tool returns dense results without error
```

Why bad: violates the project's fail-fast rule. Consumer thinks they got `nonsense`-mode results; they got `dense`. The silent substitution is the rationalization-trap (K2 §3.3) at the API surface — the tool quietly rewrote the request.

Correct shape: structured error naming the four valid modes.

### Anti-pattern: Mode without provenance

Returning multi-mode results without `mode_source` per result. Consumer cannot tell which index produced a hit, so cannot reason about reliability or composition (e.g., "the bm25 result is the trustworthy one for an exact-string query; the dense result was the fuzzy match").

Why bad: violates K2 §3.1 — every result must carry layer-attribution. The retrieval-mode is the layer; `mode_source` is the attribution.

### Anti-pattern: Build-on-demand per mode

Building each index lazily on first query of that mode. The first query of each mode pays a corpus-walk cost. The "index once, query many" amortization is lost — the consumer pays the build cost three or four times instead of once.

Why bad: defeats the economic argument of the pattern. Build all indices at corpus-version time (eager); expose each lazily as a mode (lazy query exposure, not lazy build).

### Anti-pattern: Mode-as-a-function-of-query-text

Inferring the right mode from the query text inside the tool ("if the query has quotes, use bm25; if it has a slash, use symbolic; otherwise dense"). The heuristic is a leaky abstraction — consumers who tested with one query class hit unexpected mode selection on another.

Why bad: hides the routing choice from the consumer. Default to a named mode and let consumers pass a flag if they want a different one. Server-side mode heuristics are reasonable as the *default value* of `mode` (a tool may pick `dense` for 1-hop and `multiview` for queries with multiple named entities), but the chosen mode MUST be named in the response (`response.mode` or per-result `mode_source`) so the consumer can audit.

## Cross-Plugin Notes

- `mcp-architect:progressive-discovery` — multiview composes with progressive disclosure; the layered output shape above is the application of progressive-discovery to a multi-mode retrieval tool.
- `mcp-architect:citation-verification-pattern` — each retrieval result is a per-source citation; `mode_source` is the per-result Layer-1 provenance for "which index produced this hit."
- `mcp-architect:conflict-aware-response` — multiview's `also_matched` array surfaces *agreement* across sub-indices; when sub-indices return *different* results for the same logical query, that disagreement is a candidate for `conflicts[]` surfacing.
- lci `--mode` spec (`plugins/lci/docs/lci-modes-spec.md` commit `2a649e0`) — the concrete reference implementation. New retrieval-tool authors should read that spec for the wire-format details this pattern abstracts.

## Citations

- **K2 design doc:** `docs/research/K2-knowledge-hygiene-from-papers.md` §3.4 (Multiview retrieval — dense + bm25 + symbolic + KG). Source for the four-mode taxonomy and the task-dependent-lift framing.
- **K2 §3.5** (Complexity-aware pruning). Source for the index-once-query-many economic argument and the "cheap queries get cheap routes" rule.
- **RAGSearch:** arxiv `2604.09666` — task-dependent lift finding ("graph + agentic together beat either alone, but only on multi-hop queries"). Empirical justification for why multiview is opt-in rather than default.
- **lci modes spec:** `plugins/lci/docs/lci-modes-spec.md` (commit `2a649e0`). Reference implementation that realizes this pattern for code search.

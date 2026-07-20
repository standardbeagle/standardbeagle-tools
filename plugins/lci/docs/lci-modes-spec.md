# lci `--mode` and `--conflicts` — server contract spec

**Status:** Plugin-side specification. Server implementation is downstream — owned by [github.com/standardbeagle/lci](https://github.com/standardbeagle/lci). Authoritative pattern rationale lives in `docs/research/K2-knowledge-hygiene-from-papers.md` (K2). This document is the contract surface between the plugin command UI (`plugins/lci/commands/search.md`) and the lci server.

**Plugin baseline:** lci server `0.4.0` ships `dense` only. `bm25`, `symbolic`, `multiview`, and `--conflicts` are reserved surface; the plugin command spec is fixed here so consumers (other plugins, agent skills) can write against the contract before each mode lands server-side.

**Tone reminder:** Mode selection is **soft guidance** ("default toward `dense`", "prefer `multiview` for multi-hop"). The only hard rule is K2 §3.3 (rationalization-trap), which applies to every mode: a result that silently overrides a prior high-confidence finding without surfacing the change is a bug.

---

## 1. Mode definitions

### 1.1 `dense` — embedding retrieval (DEFAULT)

- **What:** Vector-embedding retrieval over indexed symbols + content. Current `0.4.0` behavior.
- **When:** 1-hop semantic queries — "find code that does X."
- **Build requirement:** Embedding index over symbol corpus (existing).
- **Query cost:** Sub-millisecond ANN lookup.
- **Coverage class:** Paraphrase-tolerant semantic match.

### 1.2 `bm25` — lexical retrieval

- **What:** Classical BM25 inverted index over symbol names, file paths, and content.
- **When:** Exact-match queries — known function names, log lines, error messages, regex-resistant literal strings.
- **Build requirement:** Lexical inverted index (cheap; can be incremental).
- **Query cost:** Sub-millisecond exact/prefix match.
- **Coverage class:** Exact-string / known-keyword.
- **Why not `dense`:** Embeddings smear exact tokens; an error string like `"connection refused"` returns adjacent semantic neighbors instead of the literal site.

### 1.3 `symbolic` — metadata-only retrieval

- **What:** Filter over symbol metadata (file path, language, symbol kind) without scanning content or running embeddings.
- **When:** Structural enumeration — "list all interfaces in `src/api/**`," "find every Go struct named `*Config`."
- **Build requirement:** Symbol metadata index (already exists for `code_insight`).
- **Query cost:** Sub-millisecond filter; no embedding cost paid.
- **Coverage class:** Structural / metadata-only.
- **Why not `dense`:** Pure structural queries waste the embedding pass and add irrelevant semantic neighbors to results.

### 1.4 `multiview` — fused retrieval

- **What:** Parallel dispatch across `dense + bm25 + symbolic`, merged with stable provenance, plus call-hierarchy and dependency-graph signals layered on results.
- **When:** Multi-hop queries — "where does the value passed to `AuthMiddleware` originate, across the request pipeline?" Single-index retrieval misses these because the bridging hop sits in a different similarity class than the endpoints.
- **Build requirement:** All three single-mode indices PLUS call-hierarchy graph PLUS dependency graph (largest one-time cost).
- **Query cost:** Higher than single-mode but acceptable; merges N streams with a stable provenance-preserving rule.
- **Coverage class:** Multi-hop / cross-cutting.
- **Rationale:** K2 §3.4 — task-dependent lift, multi-hop queries reliably benefit. Treat as Tier 2 — opt-in, not default.

---

## 2. Input shape

```jsonc
{
  "pattern": "string",                     // existing
  "mode": "dense" | "bm25" | "symbolic" | "multiview",   // NEW; default "dense"
  "conflicts": false,                      // NEW; default false
  // ...all existing parameters (filter, symbol_types, languages, flags, max, max_per_file, include) remain unchanged
}
```

- `mode` is optional. Omission MUST behave identically to `mode: "dense"` (back-compat).
- `conflicts` is orthogonal to `mode` — any mode may be combined with conflict surfacing.
- Unrecognized `mode` value: server SHOULD fail fast with a structured error naming the four valid modes (per project rule "fail fast, report errors, never fallback data" in `CLAUDE.md`). MUST NOT silently fall back to `dense`.

---

## 3. Output shape

### 3.1 Per-mode output additions

All modes return the existing search result envelope (results array with `file`, `line`, `symbol`, `id`, etc.). The following per-result fields SHOULD be added so consumers can attribute provenance (K2 §3.1) without re-querying:

| Field | Modes | Meaning |
|---|---|---|
| `mode_source` | all | Which sub-index produced this result. Values: `"dense"`, `"bm25"`, `"symbolic"`. For `multiview`, this is the **winning** sub-index per result; ties resolved by stable order `dense > bm25 > symbolic`. |
| `mode_score` | all | Mode-native score (cosine for `dense`, BM25 for `bm25`, 1.0 for `symbolic`). For `multiview`, the merged score using the server's documented merge rule. |
| `also_matched` | `multiview` only | Array of `{mode, score}` for sub-indices that also returned this hit; lets consumers reason about agreement / disagreement. |

Existing `file:line` provenance form is **the canonical SBT provenance shape** per K2 §4.4 — other plugins standardize on it. Do not change the field name or format.

### 3.2 `--conflicts` output additions

When `conflicts: true`, results that have multiple defining sites across branches, build flags, or feature-flagged code paths MUST be expanded:

```jsonc
{
  "symbol": "encrypt",
  "conflict": true,                        // present + true when multiple defs found
  "definitions": [
    { "file": "src/crypto/aes.go",   "line": 42,  "branch": "main",          "build_tag": null },
    { "file": "src/crypto/aes.go",   "line": 87,  "branch": "main",          "build_tag": "fips" },
    { "file": "src/crypto/cha20.go", "line": 12,  "branch": "experimental",  "build_tag": null }
  ]
}
```

- `conflict: true` MUST be set whenever `definitions.length > 1`.
- Each definition entry carries enough context (`branch` and/or `build_tag`) that a consumer can decide which site is canonical for *its* situation without a follow-up query.
- When `conflicts: false` (default), behavior is unchanged — pick the single best def per existing logic.
- Render side: clients SHOULD flag conflicting results visibly. K2 §3.2 forbids silent source-bias; the field shape above is what makes the conflict visible.

---

## 4. Build-time index requirements (per mode)

| Mode | Embedding index | Lexical (BM25) index | Symbol metadata index | Call hierarchy graph | Dependency graph |
|---|:-:|:-:|:-:|:-:|:-:|
| `dense` | ✅ required | — | — | — | — |
| `bm25` | — | ✅ required | — | — | — |
| `symbolic` | — | — | ✅ required (already exists) | — | — |
| `multiview` | ✅ | ✅ | ✅ | ✅ required | ✅ required |
| `--conflicts` (orthogonal) | — | — | ✅ required (for branch / build-tag annotation pass) | — | — |

The metadata index already exists in `0.4.0` for `code_insight`. Reusing it for `symbolic` mode and for `--conflicts` annotation is the cheapest server change in this spec.

---

## 5. Migration plan (incremental rollout)

The plugin command surface ships the full mode list now. Server lands modes one at a time so each release is safely consumable:

| Step | Server release | What ships | What unblocks |
|---|---|---|---|
| 0 | `0.4.0` (current) | `dense` only | Baseline; current consumers unaffected. |
| 1 | next minor | `bm25` mode + `--conflicts` (using existing metadata index) | Exact-string queries; conflict surfacing for branch-divergent symbols. |
| 2 | following minor | `symbolic` mode (zero new index — exposes existing metadata index as a retrieval mode) | Structural-enumeration queries; cheap. |
| 3 | following minor | `multiview` mode (requires call-hierarchy + dep graph build pass) | Multi-hop queries; largest engineering lift. |

Order rationale:
- **Step 1 first** because it requires the least new build infrastructure (just the BM25 inverted index + a metadata read pass for conflicts) and unblocks the highest-frequency request class (exact-string lookup).
- **Step 2 next** because zero new index work — `symbolic` is already buildable from existing data.
- **Step 3 last** because it requires the call-hierarchy and dep-graph build passes, which are the largest one-time engineering cost. Defer until Step 1 + 2 are stable.

Each step MUST keep older modes behaviorally identical (back-compat). Each step SHOULD bump the lci server `version` and the plugin manifest version to advertise the newly available mode.

---

## 6. Citation discipline

- **K2 §3.4** (`docs/research/K2-knowledge-hygiene-from-papers.md`) — multiview retrieval rationale and Tier-2 framing.
- **K2 §3.2** — conflict surfacing across sources; `--conflicts` flag is the lci surface for this pattern.
- **K2 §4.4** — per-plugin update map for lci; `file:path:line` is the canonical SBT provenance shape.
- **Standard provenance contract** — ideation and `present:mini-ide` review flows consume the same `file:path:line` shape that lci's native results satisfy by default.
- **dev-standards multi-source rule** (commit `9ab9c47`, `plugins/dev-standards/.../SKILL.md`) — load-bearing claims need ≥2 independent sources; this spec's load-bearing claims (mode rationale, conflict-surfacing failure mode) cite both K2 (synthesis) and the originating papers / commits (RAGSearch `2604.09666`, ConflictQA `2604.11209`, `ebd136a`).

---

## 7. Out of scope (explicit)

- Server implementation — owned by `github.com/standardbeagle/lci`, not this repo.
- Knowledge-graph mode — K2 §3.4 names dense + bm25 + symbolic + KG as the four-axis pattern; KG is reserved for a separate epic (not `kx5Yf2ZTlxP6`).
- Generative reasoning over retrieved results — lci is non-generative by design (K2 §4.4 explicit no-op for rationalization-trap and conflict-resolution generation).
- Cross-mode reranking models — out of scope for v1; merge rule is documented per Step 3 server release.

---
name: lci-search
description: "\"Search codebase using Lightning Code Index semantic search. 以LCI語義搜索查找代碼庫符號。 Use when: searching for symbols, finding definitions, content search, regex search.\""
allowed-tools: " - mcp__lci__search - mcp__lci__get_context - mcp__lci__info"
---

# Code Search

以Lightning Code Index執行快速語義代碼搜索。

## Instructions

1. 以`mcp__lci__search`使用用戶搜索模式
2. 若需某結果更多詳情，以對象ID使用`mcp__lci__get_context`
3. 以清晰有序格式呈現結果

## Search Modes (`--mode`)

`--mode` selects the retrieval strategy. Default is `dense`. Other modes are **spec only** for the lci server `>=0.4.0` line — server-side implementation lives in
[github.com/standardbeagle/lci](https://github.com/standardbeagle/lci) and is not yet shipped (see formal contract in `plugins/lci/docs/lci-modes-spec.md`).

| Mode | What it does | Default-toward-when |
|---|---|---|
| `dense` | Vector embedding retrieval — current behavior. Cheap; correct for 1-hop semantic queries. | **Default.** Most queries. |
| `bm25` | Lexical only. Faster on exact-match queries (function names, error strings, log messages). | Symbol name is known; matching log/error string. |
| `symbolic` | Metadata-only retrieval (file paths, language, symbol kind). | "List all classes in module X" / structural enumeration. |
| `multiview` | Blends `dense + bm25 + symbolic` plus call hierarchy and dependency graph. Higher build-time cost; runtime acceptable. | Multi-hop queries where a single index alone misses the link. |

Rationale: see K2 §3.4 *Multiview retrieval (dense + bm25 + symbolic + KG)* in `docs/research/K2-knowledge-hygiene-from-papers.md` — task-dependent lift, multi-hop queries reliably benefit; mode selection is **soft guidance**, not a hard rule.

## Conflict Surfacing (`--conflicts`)

When a symbol has multiple definitions across branches, build configs, or feature-flagged paths, `--conflicts` lists every defining site (with branch / build-flag / `file:line`) instead of returning a single arbitrary winner. Output flags conflicting results in result rendering.

Aligned with K2 §3.2 *Conflict surfacing across sources* — silent source-bias is a knowledge-hygiene failure; surface conflicts before reasoning. Pairs with the brainstorming `<PROVENANCE-CONTRACT>` (commit `ebd136a`) which standardizes `file:path:line` provenance — the same shape lci already returns.

`--conflicts` is implemented as a flag on `search` (not a separate `lci conflict` subcommand) for surface-area economy; can be promoted to a subcommand later if usage warrants.

## Examples

- Default semantic search: `mcp__lci__search pattern="handleRequest"`
- Search with file filter: `mcp__lci__search pattern="validate" filter="*.go"`
- Search by symbol type: `mcp__lci__search pattern="User" symbol_types="struct,interface"`
- **Mode `dense`** (explicit; same as default): `mcp__lci__search pattern="parseInput" mode="dense"`
- **Mode `bm25`** (exact lexical, e.g. error string match): `mcp__lci__search pattern="connection refused" mode="bm25"`
- **Mode `symbolic`** (enumerate by metadata, no embedding cost): `mcp__lci__search pattern="" symbol_types="class" filter="internal/api/**" mode="symbolic"`
- **Mode `multiview`** (multi-hop: who-calls-what-through-where): `mcp__lci__search pattern="AuthMiddleware" mode="multiview"`
- **Conflict surfacing** (multiple defs across branches/build flags): `mcp__lci__search pattern="encrypt" conflicts=true`

## Server-impl note

Modes other than `dense` are **plugin-side spec only** at this time. The lci server (currently `0.4.0` per marketplace) implements `dense`; `bm25`, `symbolic`, and `multiview` will land via downstream releases tracked in [github.com/standardbeagle/lci](https://github.com/standardbeagle/lci). The plugin command surface is fixed here so consumers can write against the contract before server support arrives — see `plugins/lci/docs/lci-modes-spec.md` for the formal input/output contract.

# Lightning Code Index (LCI) Plugin

Sub-millisecond semantic code search and code intelligence for AI coding agents.

## Features

- **Instant Search**: Sub-millisecond semantic code search across any codebase
- **Symbol Lookup**: Find definitions, references, and implementations
- **Call Hierarchy**: Trace function calls up and down the call graph
- **Codebase Overview**: Get high-level structure analysis with 79.8% context reduction
- **Context Manifests**: Save and load code context for efficient agent handoff

## Installation

### Via npm (recommended)

```bash
npm install -g @standardbeagle/lci
```

### Via pip

```bash
pip install lightning-code-index
```

### Via Go

```bash
go install github.com/standardbeagle/lci/cmd/lci@latest
```

### MCP Registration

**Option 1: Via slop-mcp** (if available)
```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
{ "action": "register", "name": "lci", "command": "npx", "args": ["-y", "@standardbeagle/lci", "mcp"], "scope": "user" }
```

**Option 2: Add to `.mcp.json`**
```json
{
  "lci": {
    "command": "npx",
    "args": ["-y", "@standardbeagle/lci", "mcp"]
  }
}
```

## Search Modes

The `/lci:search-code` skill accepts a `--mode` argument selecting the retrieval strategy. Default is `dense`. Other modes are **specification only** at this time — the current lci server (`0.4.0`, see `marketplace.json`) implements `dense`; `bm25`, `symbolic`, and `multiview` are reserved for downstream server releases tracked in [github.com/standardbeagle/lci](https://github.com/standardbeagle/lci). The formal contract lives in `plugins/lci/docs/lci-modes-spec.md`.

| Mode | What it returns | When to prefer |
|---|---|---|
| `dense` | Vector-embedding retrieval. Current behavior. | Default. 1-hop semantic queries — "find code that does X." |
| `bm25` | Lexical match only. | Exact-match queries — known function names, error strings, log messages. |
| `symbolic` | Metadata only (file path, language, symbol kind). No content scan. | Structural enumeration — "list all classes in module X." |
| `multiview` | Blends `dense + bm25 + symbolic` plus call hierarchy and dependency graph. | Multi-hop queries where one index alone misses the link. |

### Cost trade-offs

| Mode | Build-time cost | Query-time cost | Coverage class |
|---|---|---|---|
| `dense` | Embedding pass over corpus (one-time per change) | Sub-millisecond ANN lookup | Semantic / paraphrase-tolerant |
| `bm25` | Lexical inverted index (cheap) | Sub-millisecond exact/prefix match | Exact-string / known-keyword |
| `symbolic` | Symbol metadata index (cheap, already built for `code_insight`) | Sub-millisecond filter | Structural / metadata-only |
| `multiview` | All three indices + call-hierarchy graph + dep graph (largest one-time cost) | Higher than single-mode but acceptable; merges N result streams with stable provenance | Multi-hop / cross-cutting |

Rationale: K2 §3.4 *Multiview retrieval* — task-dependent lift; only complex multi-hop queries reliably benefit, so mode selection is soft guidance (default toward `dense`). The `--conflicts` flag (see `/lci:search-code`) surfaces multiple defs across branches or build flags per K2 §3.2 *Conflict surfacing*.

## Available Tools

| Tool | Description |
|------|-------------|
| `search` | Sub-millisecond semantic code search |
| `get_context` | Get detailed context for code symbols |
| `find_files` | Find files by pattern (like `find` or `fd`) |
| `code_insight` | Codebase intelligence: overview, detailed, statistics |
| `context` | Save/load context manifests for agent handoff |
| `semantic_annotations` | Query symbols by semantic labels |
| `side_effects` | Analyze function purity and side effects |
| `info` | Get help and examples for any tool |

## Skills

- `/lci:setup-mcp` - Install and configure LCI MCP server
- `/lci:mcp-status` - Check MCP server registration status
- `/lci:search-code` - Find symbols, patterns, implementations, and files via LCI semantic search
- `/lci:explore-codebase` - Understand codebase architecture, structure, and patterns
- `/lci:trace-symbol` - Trace call hierarchies, dependencies, side effects, and symbol relationships
- `/lci:context-handoff` - Save/load code context manifests for agent handoff and session continuity
- `/lci:pre-commit-review` - Analyze staged/uncommitted changes for quality issues before committing
- `/lci:commit-all` - Orchestrate WIP prep and auto-commit by dispatching dedicated agents
- `/lci:force-lci` - Toggle force-LCI mode to block standard search tools and require LCI
- `/lci:agnt-companion` - Points at the sibling agnt plugin for running code, browser debugging, and audits

## Agents

- `code-quality` - Runs LCI quality analysis, linters, and formatters; removes debug artifacts and fixes findings
- `context-gatherer` - Gathers WIP context from git, tasks, plans, and LCI into a structured change summary
- `doc-updater` - Updates internal docs (CHANGELOG, inline docs, plan files) that already exist in the project
- `marketing-seo` - Updates public-facing docs (README, package metadata) with benefit-oriented, SEO-aware content
- `tdd-refactor` - Antagonistic TDD refactoring agent using LCI to find testability issues and eliminate mocking
- `test-fixer` - Runs the full test suite, fixes all failures, and adds missing coverage using LCI

## Requirements

- Node.js 14+ (for npx) or Python 3.8+ (for pip)
- Codebase is indexed automatically on first use

## License

MIT

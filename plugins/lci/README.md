# Lightning Code Index (LCI) Plugin

Sub-millisecond semantic code search and code intelligence for AI coding agents.

## Features

- **Instant Search**: Sub-millisecond semantic code search across any codebase
- **Symbol Lookup**: Find definitions, references, and implementations
- **Call Hierarchy**: Trace function calls up and down the call graph
- **Codebase Overview**: Get high-level structure analysis with 79.8% context reduction
- **Context Manifests**: Save and load code context for efficient agent handoff

## Installation

```bash
# Install from marketplace
claude mcp add lci --plugin lci@standardbeagle-tools

# Or install lci binary directly
go install github.com/standardbeagle/lci/cmd/lci@latest
```

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

## Commands

- `/lci:search` - Search the codebase
- `/lci:explore` - Explore codebase structure
- `/lci:context` - Get detailed symbol context

## Requirements

- `lci` binary must be installed and in PATH
- Codebase should be indexed (happens automatically on first use)

## License

MIT

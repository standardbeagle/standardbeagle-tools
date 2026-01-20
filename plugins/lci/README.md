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
- `/lci:code-context` - Get detailed symbol context

## Skills

- `/lci:setup-mcp` - Install and configure LCI MCP server
- `/lci:mcp-status` - Check MCP server registration status

## Requirements

- Node.js 14+ (for npx) or Python 3.8+ (for pip)
- Codebase is indexed automatically on first use

## License

MIT

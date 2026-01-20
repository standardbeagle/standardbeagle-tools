# Standard Beagle Tools Plugin

The complete Standard Beagle toolkit combining **agnt** (browser superpowers) and **lci** (code intelligence) for the ultimate AI coding experience.

## Features

### From agnt
- **Process Management**: Run and manage dev servers with output capture
- **Reverse Proxy**: HTTP traffic logging and frontend instrumentation
- **Browser Debugging**: 50+ diagnostic functions injected into pages
- **Sketch Mode**: Excalidraw-like wireframing directly on the UI
- **Design Mode**: AI-assisted UI iteration with live preview

### From lci (Lightning Code Index)
- **Instant Search**: Sub-millisecond semantic code search
- **Symbol Lookup**: Find definitions, references, and implementations
- **Call Hierarchy**: Trace function calls up and down the call graph
- **Codebase Overview**: High-level structure analysis with 79.8% context reduction
- **Context Manifests**: Save and load code context for efficient agent handoff

## Installation

### Install the binaries

```bash
# Via npm (recommended)
npm install -g @standardbeagle/agnt @standardbeagle/lci

# Via pip
pip install agnt lightning-code-index

# Via Go (lci only)
go install github.com/standardbeagle/lci/cmd/lci@latest
```

### Register MCP servers

**Option 1: Via slop-mcp** (if available)
```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
{ "action": "register", "name": "agnt", "command": "npx", "args": ["-y", "@standardbeagle/agnt", "mcp"], "scope": "user" }
{ "action": "register", "name": "lci", "command": "npx", "args": ["-y", "@standardbeagle/lci", "mcp"], "scope": "user" }
```

**Option 2: Add to `.mcp.json`**
```json
{
  "agnt": {
    "command": "npx",
    "args": ["-y", "@standardbeagle/agnt", "mcp"]
  },
  "lci": {
    "command": "npx",
    "args": ["-y", "@standardbeagle/lci", "mcp"]
  }
}
```

## Commands

| Command | Description |
|---------|-------------|
| `/tools:setup-project` | Configure project for optimal development |
| `/tools:dev-proxy` | Start dev server with browser debugging |
| `/tools:search` | Search codebase with semantic search |
| `/tools:explore` | Explore codebase structure |

## Agents

| Agent | Description |
|-------|-------------|
| `browser-debugger` | Debug browser issues using agnt diagnostics |
| `code-explorer` | Explore codebases using lci |

## Skills

- `/tools:setup-mcp` - Install and configure both agnt and lci MCP servers

## Requirements

- Node.js 14+ (for npx) or local binary installation
- agnt: For browser features, requires Chrome/Chromium
- lci: Codebase indexed automatically on first use

## License

MIT

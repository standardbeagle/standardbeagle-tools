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

```bash
# Install from marketplace (recommended)
claude mcp add tools --plugin tools@standardbeagle-tools

# Or install individual plugins
claude mcp add agnt --plugin agnt@standardbeagle-tools
claude mcp add lci --plugin lci@standardbeagle-tools
```

## Requirements

Both binaries must be installed and in PATH:
- `agnt` - Browser superpowers ([installation](https://github.com/standardbeagle/agnt))
- `lci` - Code intelligence ([installation](https://github.com/standardbeagle/lci))

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

## License

MIT

# Standard Beagle Tools

AI coding agent toolkit - browser superpowers, code intelligence, and development tools.

## Plugins

This marketplace contains 13 plugins for Claude Code:

| Plugin | Description | Version | Category |
|--------|-------------|---------|----------|
| **agnt** | Browser superpowers: process management, reverse proxy, frontend debugging, sketch mode | 0.7.12 | development |
| **lci** | Lightning Code Index: sub-millisecond semantic code search | 0.4.0 | development |
| **tools** | Complete toolkit combining agnt and lci | 1.0.0 | development |
| **mcp-architect** | Design high-quality MCP servers with progressive discovery and token efficiency | 0.1.0 | development |
| **mcp-tester** | MCP server testing and debugging with mcp-debug | 0.2.0 | development |
| **slop-mcp** | SLOP integration for MCP management and orchestration | 0.2.0 | development |
| **slop-coder** | SLOP language coding assistant and reference | 0.1.0 | development |
| **dartai** | Dart task management with adversarial cooperation loops | 0.3.0 | development |
| **workflow** | General-purpose adversarial workflow automation | 0.1.0 | development |
| **figma-query** | Token-efficient Figma integration with design library extraction | 0.1.0 | design |
| **ux-design** | UX design principles, color theory, typography, and accessibility | 0.1.0 | design |
| **ux-developer** | UX-driven development with WCAG 2.2 and usability best practices | 0.1.0 | development |
| **prompt-engineer** | State-of-the-art prompt and context engineering for 2026 | 0.1.0 | ai |

## Installation

### Step 1: Install the binaries

```bash
# Via npm (recommended)
npm install -g @standardbeagle/agnt @standardbeagle/lci

# Via pip
pip install agnt lightning-code-index

# Via Go (lci only)
go install github.com/standardbeagle/lci/cmd/lci@latest
```

### Step 2: Register MCP servers

**Option A: Via slop-mcp** (recommended if available)
```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
{ "action": "register", "name": "agnt", "command": "npx", "args": ["-y", "@standardbeagle/agnt", "mcp"], "scope": "user" }
{ "action": "register", "name": "lci", "command": "npx", "args": ["-y", "@standardbeagle/lci", "mcp"], "scope": "user" }
```

**Option B: Add to `.mcp.json`**
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

### Step 3 (Optional): Install Claude Code plugins

The plugins provide commands, skills, and agents that help you use the MCP tools:

```bash
# Install the complete toolkit (recommended)
claude plugin add tools@standardbeagle-tools

# Or install individual plugins
claude plugin add agnt@standardbeagle-tools
claude plugin add lci@standardbeagle-tools
```

## Plugin Details

### agnt - Browser Superpowers

Give your AI coding agent browser superpowers:

- **Process Management**: Run and manage dev servers with output capture
- **Reverse Proxy**: HTTP traffic logging with automatic frontend instrumentation
- **Browser Debugging**: 50+ diagnostic functions (`__devtool` API)
- **Sketch Mode**: Excalidraw-like wireframing directly on the UI
- **Design Mode**: AI-assisted UI iteration with live preview
- **Error Capture**: JavaScript errors automatically available to agent

**Requirements**: `agnt` binary via npm/pip or [GitHub releases](https://github.com/standardbeagle/agnt)

### lci - Lightning Code Index

Sub-millisecond semantic code search and code intelligence:

- **Instant Search**: Find code patterns across any codebase in <5ms
- **Symbol Lookup**: Definitions, references, and implementations
- **Call Hierarchy**: Trace function calls up and down
- **Codebase Overview**: 79.8% context reduction for efficient analysis
- **Context Manifests**: Save/load code context for agent handoff
- **Side Effect Analysis**: Function purity and mutation tracking

**Requirements**: `lci` binary via npm/pip/go or [GitHub releases](https://github.com/standardbeagle/lci)

### tools - Complete Toolkit

Best of both worlds - combines agnt and lci for the ultimate AI coding experience.

**Requirements**: Both `agnt` and `lci` binaries

## Repository Structure

```
standardbeagle-tools/
├── .claude-plugin/
│   └── marketplace.json      # Marketplace registry
├── plugins/
│   ├── agnt/                 # Browser superpowers plugin
│   │   ├── .claude-plugin/
│   │   ├── commands/
│   │   ├── skills/
│   │   ├── agents/
│   │   └── mcp.json.disabled
│   ├── lci/                  # Code intelligence plugin
│   │   ├── .claude-plugin/
│   │   ├── commands/
│   │   ├── skills/
│   │   └── mcp.json.disabled
│   └── tools/                # Combined plugin
│       ├── .claude-plugin/
│       ├── commands/
│       ├── agents/
│       └── mcp.json.disabled
└── README.md
```

Note: The `mcp.json.disabled` files contain example configurations. MCP servers should be registered via slop-mcp or your personal `.mcp.json` to avoid duplicate registrations.

## Development

### Local Development Setup

After cloning, run the setup script to configure git filters for local development:

```bash
./scripts/setup-dev.sh
```

This configures git smudge/clean filters so that:
- **Locally**: `mcp.json` files use local binaries (`agnt`, `lci`)
- **In commits**: `mcp.json` files use npx commands for deployment

The filters are stored in your local git config. If you clone fresh, re-run the setup script.

### Testing Plugins Locally

```bash
# Add marketplace from local directory
claude plugin add-dir /path/to/standardbeagle-tools

# Or test individual plugin
claude plugin add agnt --source ./plugins/agnt
```

### Publishing

Plugins are published via the Claude Code marketplace. The `marketplace.json` defines all available plugins and their metadata.

## License

MIT

## Author

[Standard Beagle](https://github.com/standardbeagle)

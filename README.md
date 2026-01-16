# Standard Beagle Tools

AI coding agent toolkit - browser superpowers, code intelligence, and development tools.

## Plugins

This marketplace contains 13 plugins for Claude Code:

| Plugin | Description | Version | Category |
|--------|-------------|---------|----------|
| **agnt** | Browser superpowers: process management, reverse proxy, frontend debugging, sketch mode | 0.7.12 | development |
| **lci** | Lightning Code Index: sub-millisecond semantic code search | 0.3.0 | development |
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

## Quick Install

```bash
# Install the complete toolkit (recommended)
claude mcp add tools --plugin tools@standardbeagle-tools

# Or install individual plugins
claude mcp add agnt --plugin agnt@standardbeagle-tools
claude mcp add lci --plugin lci@standardbeagle-tools
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

**Requirements**: `agnt` binary ([install](https://github.com/standardbeagle/agnt))

### lci - Lightning Code Index

Sub-millisecond semantic code search and code intelligence:

- **Instant Search**: Find code patterns across any codebase in <5ms
- **Symbol Lookup**: Definitions, references, and implementations
- **Call Hierarchy**: Trace function calls up and down
- **Codebase Overview**: 79.8% context reduction for efficient analysis
- **Context Manifests**: Save/load code context for agent handoff
- **Side Effect Analysis**: Function purity and mutation tracking

**Requirements**: `lci` binary ([install](https://github.com/standardbeagle/lci))

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
│   │   └── mcp.json
│   ├── lci/                  # Code intelligence plugin
│   │   ├── .claude-plugin/
│   │   ├── commands/
│   │   └── mcp.json
│   └── tools/                # Combined plugin
│       ├── .claude-plugin/
│       ├── commands/
│       ├── agents/
│       └── mcp.json
└── README.md
```

## Development

### Local Development Setup

After cloning, run the setup script to configure git filters for local development:

```bash
./scripts/setup-dev.sh
```

This configures git smudge/clean filters so that:
- **Locally**: `mcp.json` files use local binaries (`agnt`, `slop-mcp`)
- **In commits**: `mcp.json` files use npx commands for deployment

The filters are stored in your local git config. If you clone fresh, re-run the setup script.

**How it works**: Git's smudge filter transforms files on checkout (repo → local), and the clean filter transforms on stage (local → repo). This lets you develop with local binaries while commits always contain the npx versions.

### Testing Plugins Locally

```bash
# Add marketplace from local directory
claude mcp add-dir /path/to/standardbeagle-tools

# Or test individual plugin
claude mcp add agnt --source ./plugins/agnt
```

### Publishing

Plugins are published via the Claude Code marketplace. The `marketplace.json` defines all available plugins and their metadata.

## License

MIT

## Author

[Standard Beagle](https://github.com/standardbeagle)

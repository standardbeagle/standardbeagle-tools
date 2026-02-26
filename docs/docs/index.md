---
title: Standard Beagle Tools - Claude Code Plugins & MCP Servers
description: Discover powerful Claude Code plugins for browser debugging, semantic code search, workflow automation, and MCP server management. Install in seconds, boost productivity immediately.
keywords: [Claude Code, Claude AI, MCP, plugins, browser debugging, code intelligence, workflow automation]
sidebar_position: 1
slug: /
---

# Standard Beagle Tools

Supercharge your Claude Code experience with powerful plugins for **browser debugging**, **semantic code search**, and **workflow automation**.

## Why Standard Beagle Tools?

:::tip Instant Productivity Boost
Install any plugin in under 30 seconds and immediately unlock new capabilities. No complex configuration required.
:::

### 🚀 Key Benefits

- **Browser Superpowers**: Debug web applications directly from Claude Code with reverse proxy, live screenshots, and sketch mode
- **Lightning Code Intelligence**: Sub-millisecond semantic code search with 79.8% context reduction
- **Workflow Automation**: Adversarial quality loops, task tracking, and process improvement suggestions
- **MCP Server Management**: Unified SLOP-based management for all your Model Context Protocol servers

### 📦 Available Plugins

| Plugin | Description | Use Case |
|--------|-------------|----------|
| [**agnt**](/docs/plugins/agnt) | Browser superpowers with process management | Frontend debugging, UI/UX analysis |
| [**lci**](/docs/plugins/lci) | Lightning Code Index for semantic search | Code exploration, symbol navigation |
| [**tools**](/docs/plugins/tools) | Combined agnt + lci toolkit | Full-stack development |
| [**workflow**](/docs/plugins/workflow) | Task automation with adversarial loops | Quality-focused development |
| [**dartai**](/docs/plugins/dartai) | Dart task management integration | Project management |
| [**figma-query**](/docs/plugins/figma-query) | Figma design extraction | Design-to-code workflows |
| [**slop-mcp**](/docs/plugins/slop-mcp) | MCP server management | Infrastructure setup |

## Quick Start

### Install the Marketplace

```bash
claude mcp add-dir https://github.com/standardbeagle/standardbeagle-tools
```

### Install Individual Plugins

```bash
# Install browser superpowers
claude mcp add agnt --source ./plugins/agnt

# Install code intelligence
claude mcp add lci --source ./plugins/lci

# Install combined toolkit
claude mcp add tools --source ./plugins/tools
```

## How It Works

Standard Beagle Tools uses the **Model Context Protocol (MCP)** to extend Claude Code's capabilities. Each plugin provides:

1. **Slash Commands**: User-invocable commands like `/dev-proxy`, `/search`
2. **Skills**: Specialized prompts for complex workflows
3. **Agents**: Autonomous agents for multi-step tasks
4. **Hooks**: Lifecycle hooks for session management

## Architecture

```mermaid
graph TD
    A[Claude Code] --> B[Plugin Marketplace]
    B --> C[agnt Plugin]
    B --> D[lci Plugin]
    B --> E[tools Plugin]
    C --> F[@standardbeagle/agnt MCP]
    D --> G[@standardbeagle/lci MCP]
    E --> F
    E --> G
    F --> H[Browser Debugging]
    G --> I[Code Index]
```

## Community & Support

- **GitHub**: [standardbeagle/standardbeagle-tools](https://github.com/standardbeagle/standardbeagle-tools)
- **Issues**: [Report a bug](https://github.com/standardbeagle/standardbeagle-tools/issues)
- **NPM**: [@standardbeagle/agnt](https://www.npmjs.com/package/@standardbeagle/agnt) | [@standardbeagle/lci](https://www.npmjs.com/package/@standardbeagle/lci)

## License

MIT License - Free for personal and commercial use.

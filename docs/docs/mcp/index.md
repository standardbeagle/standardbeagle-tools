---
title: MCP Servers Overview
description: Explore the MCP (Model Context Protocol) servers from Standard Beagle. Browser debugging, code intelligence, and more for Claude Code.
keywords: [MCP servers, Model Context Protocol, Claude Code MCP, browser debugging MCP, code search MCP]
sidebar_position: 1
---

# MCP Servers Overview

Standard Beagle provides high-quality MCP (Model Context Protocol) servers that extend Claude Code's capabilities.

## What is MCP?

The Model Context Protocol (MCP) is an open standard for connecting AI assistants to external tools and data sources. MCP servers provide:

- **Tools**: Functions that Claude can call
- **Resources**: Data sources Claude can read
- **Prompts**: Pre-defined prompts for specific tasks

## Available Servers

| Server | NPM Package | Description |
|--------|-------------|-------------|
| [agnt](./agnt-server) | `@standardbeagle/agnt` | Browser debugging and automation |
| [lci](./lci-server) | `@standardbeagle/lci` | Lightning code intelligence |

## Installation

### Using NPX (Recommended)

```bash
# Run directly with npx
npx @standardbeagle/agnt@latest mcp
npx @standardbeagle/lci@latest mcp
```

### Using Plugins

```bash
# Install plugin (includes MCP server)
claude mcp add agnt --source ./plugins/agnt
claude mcp add lci --source ./plugins/lci
```

### Global Installation

```bash
# Install globally
npm install -g @standardbeagle/agnt
npm install -g @standardbeagle/lci

# Run MCP server
agnt mcp
lci mcp
```

## Configuration

### Claude Code Configuration

Add to your Claude Code configuration:

```json
{
  "mcpServers": {
    "agnt": {
      "command": "npx",
      "args": ["-y", "@standardbeagle/agnt@latest", "mcp"]
    },
    "lci": {
      "command": "npx",
      "args": ["-y", "@standardbeagle/lci@latest", "mcp"]
    }
  }
}
```

### Environment Variables

```bash
# agnt configuration
export AGNT_DAEMON_URL="http://localhost:8080"

# lci configuration
export LCI_INDEX_PATH=".lci-index"
```

## MCP Specification

All servers follow the official MCP specification:

- **Version**: 2025-06-18
- **Transport**: stdio
- **Capabilities**: tools, resources (where applicable)

### Resources

- [MCP Specification](https://modelcontextprotocol.io/specification/2025-06-18)
- [MCP Architecture](https://modelcontextprotocol.io/docs/learn/architecture)
- [Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)

## Versioning

Servers follow semantic versioning:

- **Major**: Breaking changes
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes

Always use `@latest` tag for automatic updates:

```bash
npx @standardbeagle/agnt@latest mcp
```

## Security

All servers:

- Run locally (no external network calls)
- Use stdio transport (secure)
- Don't store credentials
- Respect file system permissions

## Support

- **Issues**: [GitHub Issues](https://github.com/standardbeagle/standardbeagle-tools/issues)
- **NPM**: View package pages for each server
- **Documentation**: See individual server pages

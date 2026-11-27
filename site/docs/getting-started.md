---
title: Getting Started with Standard Beagle Tools
description: Learn how to install and configure Standard Beagle Tools plugins for Claude Code. Step-by-step guide with examples and troubleshooting tips.
keywords: [Claude Code setup, install plugins, MCP configuration, getting started guide]
sidebar_position: 2
---

# Getting Started

Get up and running with Standard Beagle Tools in under 5 minutes.

## Prerequisites

- **Claude Code CLI** installed ([installation guide](https://code.claude.com/docs/en/installation))
- **Node.js 18+** installed
- **Git** for cloning the repository

## Installation Methods

### Method 1: Add Marketplace (Recommended)

Add the entire marketplace to access all plugins:

```bash
# Add from GitHub
claude mcp add-dir https://github.com/standardbeagle/standardbeagle-tools

# Or add from local directory
claude mcp add-dir /path/to/standardbeagle-tools
```

### Method 2: Install Individual Plugins

Install only the plugins you need:

```bash
# Clone the repository
git clone https://github.com/standardbeagle/standardbeagle-tools.git
cd standardbeagle-tools

# Install specific plugin
claude mcp add agnt --source ./plugins/agnt
```

### Method 3: Direct NPM Installation

For MCP servers without the plugin wrapper:

```bash
# Install agnt MCP server globally
npm install -g @standardbeagle/agnt

# Configure in Claude Code
claude mcp add agnt-mcp --command "agnt mcp"
```

## First Steps

### 1. Verify Installation

Check that plugins are installed:

```bash
claude mcp list
```

Expected output:
```
agnt (v0.7.12) - Browser superpowers for Claude Code
lci (v0.3.0) - Lightning code intelligence
tools (v1.0.0) - Combined toolkit
```

### 2. Test a Command

Try your first plugin command:

```bash
# In Claude Code session
/setup-project
```

This configures auto-start scripts and proxies for your project.

### 3. Explore Available Commands

List all available slash commands:

| Plugin | Commands | Description |
|--------|----------|-------------|
| agnt | `/dev-proxy`, `/setup-project`, `/screenshot` | Browser debugging |
| lci | `/search`, `/explore`, `/context` | Code intelligence |
| tools | All of the above | Combined access |

## Configuration

### Environment Variables

Some plugins use environment variables:

```bash
# agnt plugin
export AGNT_SESSION_CODE="your-session-code"

# lci plugin
export LCI_FORCE_MODE="true"  # Block Grep/Glob tools
```

### Project Configuration

Create `.agnt.kdl` in your project root for auto-start:

```kdl
// .agnt.kdl
scripts {
    start "npm run dev"
    test "npm test"
}

proxies {
    frontend {
        from "localhost:3000"
        to "localhost:8080"
    }
}
```

## Troubleshooting

### Plugin Not Loading

**Symptom**: Plugin doesn't appear in `claude mcp list`

**Solution**:
1. Check the plugin path is correct
2. Verify `plugin.json` exists in `.claude-plugin/`
3. Run `claude mcp add <name> --source ./path/to/plugin` again

### MCP Server Connection Failed

**Symptom**: "Failed to connect to MCP server" error

**Solution**:
1. Ensure Node.js 18+ is installed
2. Check npm package is published: `npm view @standardbeagle/agnt`
3. Try with explicit version: `@standardbeagle/agnt@0.7.12`

### Commands Not Found

**Symptom**: Slash commands don't appear

**Solution**:
1. Restart Claude Code session
2. Check command files exist in `commands/` directory
3. Verify command frontmatter is valid

## Next Steps

- [Configure agnt for browser debugging](/docs/plugins/agnt)
- [Set up lci for code search](/docs/plugins/lci)
- [Explore the combined tools plugin](/docs/plugins/tools)

## Need Help?

- [GitHub Issues](https://github.com/standardbeagle/standardbeagle-tools/issues)
- [Documentation](/docs/)

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is a **Claude Code marketplace repository** that packages and distributes three MCP plugins:

1. **agnt** (v0.7.12) - Browser superpowers: process management, reverse proxy, frontend debugging, sketch mode
2. **lci** (v0.3.0) - Lightning code intelligence: sub-millisecond semantic code search
3. **tools** (v1.0.0) - Combined toolkit with both agnt and lci capabilities

## Essential Resources

### Plugin Development
- **Plugin Marketplaces Guide**: https://code.claude.com/docs/en/plugin-marketplaces

### MCP (Model Context Protocol)
- **MCP Specification**: https://modelcontextprotocol.io/specification/2025-06-18
- **MCP Architecture**: https://modelcontextprotocol.io/docs/learn/architecture
- **Code Execution with MCP**: https://www.anthropic.com/engineering/code-execution-with-mcp
- **Long-Running Agent Harnesses**: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents

## Marketplace Concepts

### What is a Marketplace?

A **plugin marketplace** is a catalog that distributes Claude Code extensions. It provides:
- Centralized plugin discovery
- Version tracking and automatic updates
- Support for multiple source types (local, GitHub, Git)
- Team-wide configuration management

### Distribution Flow

1. **Marketplace** (this repo) - Catalog of available plugins via `marketplace.json`
2. **Plugin Source** - Where plugin files live (local directory, GitHub repo, Git URL)
3. **Plugin Cache** - Claude Code copies plugins to local cache on installation
4. **MCP Servers** - External binaries/services that plugins invoke (via npx in this project)

### Key Files

**`.claude-plugin/marketplace.json`** - Marketplace registry
```json
{
  "name": "standardbeagle-tools",
  "owner": { "name": "Standard Beagle" },
  "plugins": [
    {
      "name": "agnt",
      "source": "./plugins/agnt",
      "version": "0.7.12",
      "description": "...",
      // ... metadata
    }
  ]
}
```

**`plugins/<name>/.claude-plugin/plugin.json`** - Plugin manifest
```json
{
  "name": "agnt",
  "version": "0.7.12",
  "description": "...",
  "commands": ["./commands/dev-proxy.md"],
  "skills": ["./skills/schedule.md"],
  "agents": ["./agents/browser-debugger.md"],
  "hooks": "./hooks/hooks.json",
  "mcpServers": "./mcp.json"
}
```

### The `strict` Field

**`strict: true` (default)**: Plugin MUST have its own `plugin.json`. Marketplace entry fields merge with it.
**`strict: false`**: Plugin doesn't need `plugin.json`. Marketplace entry defines everything.

This marketplace uses `strict: true` (implicit default) - each plugin has its own `plugin.json`.

## Architecture

### Marketplace Structure

```
.claude-plugin/
  └── marketplace.json          # Marketplace registry - defines all available plugins

plugins/
  ├── agnt/                     # Browser superpowers plugin
  │   ├── .claude-plugin/
  │   │   └── plugin.json       # Plugin metadata
  │   ├── commands/             # Slash commands (e.g., /setup-project, /dev-proxy)
  │   ├── skills/               # Skills (e.g., schedule.md, workflow.md)
  │   ├── agents/               # Specialized agents (browser-debugger, ui-designer, process-manager)
  │   ├── hooks/
  │   │   └── hooks.json        # Session lifecycle hooks
  │   ├── scripts/              # Hook implementation scripts
  │   └── mcp.json              # MCP server configuration (npx @standardbeagle/agnt)
  │
  ├── lci/                      # Code intelligence plugin
  │   ├── .claude-plugin/
  │   │   └── plugin.json
  │   ├── commands/             # Slash commands (/search, /explore, /context)
  │   └── mcp.json              # MCP server configuration (npx @standardbeagle/lci)
  │
  └── tools/                    # Combined plugin
      ├── .claude-plugin/
      │   └── plugin.json
      ├── commands/             # Combined commands from both plugins
      ├── agents/               # Combined agents
      └── mcp.json              # Both MCP servers
```

### Plugin Architecture

Each plugin follows this structure:

- **`.claude-plugin/plugin.json`** - Plugin metadata (name, version, author, keywords)
- **`mcp.json`** - MCP server configuration using `npx @standardbeagle/<plugin>@latest mcp`
- **`commands/*.md`** - Slash commands available to users
- **`skills/*.md`** - Skills that provide specialized capabilities
- **`agents/*.md`** - Specialized agents for complex workflows

### MCP Server Integration

All plugins use **npx-based MCP servers** that pull from published npm packages:
- `agnt` → `npx @standardbeagle/agnt@latest mcp`
- `lci` → `npx @standardbeagle/lci@latest mcp`

The actual MCP server implementations live in separate repositories:
- https://github.com/standardbeagle/agnt
- https://github.com/standardbeagle/lci

### Session Management (agnt plugin)

The agnt plugin includes sophisticated **session lifecycle hooks** via `hooks/hooks.json`:

- **SessionStart** - Initialize session tracking and connect to agnt daemon
- **PreToolUse** - Heartbeat before every tool use
- **PostToolUse** - Track activity for Write/Edit, Bash, Task, TodoWrite
- **ToolError** - Log errors to session
- **Stop** - Disconnect and cleanup
- **Notification** - Forward notifications to browser

Hook scripts in `plugins/agnt/scripts/` implement session tracking, activity monitoring, and browser notifications.

## Testing Plugins Locally

```bash
# Add marketplace from local directory
claude mcp add-dir /home/beagle/work/standardbeagle-tools

# Or test individual plugin
claude mcp add agnt --source ./plugins/agnt
claude mcp add lci --source ./plugins/lci
claude mcp add tools --source ./plugins/tools
```

## Version Management

When updating plugin versions:

1. Update version in `.claude-plugin/plugin.json`
2. Update version in `marketplace.json` (plugins array)
3. Ensure MCP servers are published to npm with matching versions
4. Verify `mcp.json` uses `@latest` or specific version tag

## Key Concepts

### Plugin vs MCP Server

- **Plugins** (this repo) - Metadata, commands, skills, agents, hooks
- **MCP Servers** (separate repos) - Actual tool implementations accessed via MCP protocol

Plugins are lightweight wrappers that configure and integrate MCP servers into Claude Code.

### Commands vs Skills vs Agents

- **Commands** - User-invocable slash commands (e.g., `/dev-proxy`, `/search`)
- **Skills** - Specialized prompts/workflows that can be invoked
- **Agents** - Autonomous agents for complex multi-step tasks

### The "tools" Plugin Strategy

The `tools` plugin demonstrates how to **combine multiple MCP servers** in one plugin:
- Includes both `agnt` and `lci` in `mcp.json`
- Cherry-picks best commands from both plugins
- Provides unified experience for common workflows

## Plugin Development Guide

### Critical Concepts

#### Plugin Caching and File References

**CRITICAL**: Plugins are copied to a cache location when installed. This means:
- ✅ Plugin files must be self-contained within their directory
- ❌ CANNOT use relative paths like `../shared-utils` to reference files outside plugin directory
- ✅ Use symlinks (followed during copy) if you need to share files
- ✅ Use `${CLAUDE_PLUGIN_ROOT}` variable to reference files within the plugin

**Example - Correct path usage:**
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh"
          }
        ]
      }
    ]
  },
  "mcpServers": {
    "agnt": {
      "command": "npx",
      "args": ["-y", "@standardbeagle/agnt@latest", "mcp"]
    }
  }
}
```

#### MCP Server Integration Patterns

This marketplace uses **npx-based MCP servers** for:
- Automatic version management (`@latest` always gets newest)
- No local installation required
- Cross-platform compatibility
- Clean separation of concerns

**Pattern used in this project:**
```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@standardbeagle/package@latest", "mcp"],
      "env": {}
    }
  }
}
```

**Alternative patterns** (not used here, but valid):
- Local binary: `"command": "${CLAUDE_PLUGIN_ROOT}/bin/server"`
- System binary: `"command": "my-mcp-server"`
- Python package: `"command": "uvx", "args": ["my-mcp-package"]`

### Plugin Components

#### Commands (`commands/*.md`)
Slash commands that users can invoke (e.g., `/dev-proxy`, `/search`)

**Structure:**
```markdown
---
name: command-name
description: What it does
---

Command implementation details and instructions to Claude...
```

#### Skills (`skills/*.md`)
Specialized prompts/workflows that can be invoked programmatically

**Use cases:**
- Complex multi-step workflows
- Reusable prompt templates
- Scheduled tasks

#### Agents (`agents/*.md`)
Autonomous agents for complex multi-step tasks

**Use cases:**
- Browser debugging workflows
- Code exploration tasks
- UI design iteration

#### Hooks (`hooks/hooks.json`)
Lifecycle hooks that execute at specific events

**Available hooks:**
- `SessionStart` - When Claude Code session begins
- `PreToolUse` - Before any tool is invoked
- `PostToolUse` - After tool completes (can match specific tools)
- `ToolError` - When tool fails
- `Stop` - When session ends
- `Notification` - When notification is triggered

**Example from agnt plugin:**
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/notify-file-change.sh",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

### Version Management Workflow

When releasing a new plugin version:

1. **Update plugin manifest**: `plugins/<name>/.claude-plugin/plugin.json`
   ```json
   { "version": "0.8.0" }
   ```

2. **Update marketplace registry**: `.claude-plugin/marketplace.json`
   ```json
   {
     "plugins": [
       { "name": "agnt", "version": "0.8.0" }
     ]
   }
   ```

3. **Ensure MCP server is published** to npm with matching/compatible version
   - This project uses `@latest` tag so any published version works
   - Could pin to specific version: `@standardbeagle/agnt@0.8.0`

4. **Tag the release** in Git
   ```bash
   git tag -a v0.8.0 -m "Release agnt v0.8.0"
   git push origin v0.8.0
   ```

### Testing and Validation

**Local Testing:**
```bash
# Add marketplace from local directory
claude mcp add-dir /path/to/standardbeagle-tools

# Or test individual plugin
claude mcp add agnt --source ./plugins/agnt
```

**Validation:**
```bash
# Validate marketplace structure
claude plugin validate .

# Validate specific plugin
claude plugin validate ./plugins/agnt
```

**Common validation issues:**
- Missing `.claude-plugin/marketplace.json` or `plugin.json`
- Invalid JSON syntax
- Duplicate plugin names
- Path traversal (`..` in source paths)
- Missing referenced files (commands, skills, agents)

### Best Practices for This Marketplace

1. **Always use `${CLAUDE_PLUGIN_ROOT}`** for file references in hooks and configs
2. **Use npx with `@latest`** for MCP servers to avoid version mismatches
3. **Keep plugins self-contained** - no external file dependencies
4. **Test locally** before pushing with `claude plugin validate .`
5. **Follow semantic versioning** (major.minor.patch)
6. **Document commands clearly** with descriptions in frontmatter
7. **Use kebab-case** for all names (plugins, commands, agents)
8. **Sync versions** across plugin.json and marketplace.json
9. **Test with actual MCP servers** - ensure npx packages are published
10. **Use hooks sparingly** - they execute on every matching event

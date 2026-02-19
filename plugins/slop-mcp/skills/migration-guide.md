---
name: migration-guide
description: Guide for migrating MCP configurations to slop-mcp management
---

# MCP to slop-mcp Migration Guide

Migrate existing MCP server configurations from Claude Desktop, VS Code, or other clients to slop-mcp managed configs using KDL.

## Why Migrate to slop-mcp?

1. **Unified tool discovery** -- search across all MCP servers with `search_tools`
2. **Dynamic management** -- register and unregister servers at runtime without restarting Claude Code
3. **SLOP scripting** -- automate multi-tool workflows with the SLOP language via `run_slop`
4. **Scope control** -- user-level, project-level, or memory-only configurations
5. **KDL config** -- cleaner config format than scattered JSON files

## Migration Sources

### Claude Desktop

Location:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Linux: `~/.config/claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

Format:
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"],
      "env": {}
    }
  }
}
```

### VS Code

Location: `.vscode/mcp.json` or workspace settings

### Claude Code Settings

Location: `~/.claude/settings.json` (mcpServers section)

### Cursor

Location: `~/.cursor/mcp.json`

## Migration Steps

### Step 1: Check Current State

Call `manage_mcps` to see what is already registered:

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "list"
```

### Step 2: Read Source Config

Read the source configuration file (e.g., Claude Desktop config) and parse each `mcpServers` entry.

### Step 3: Register Each Server

For each server in the source config, call `manage_mcps` with `action: "register"`:

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "register"
  name: "filesystem"
  type: "command"
  command: "npx"
  args: ["-y", "@modelcontextprotocol/server-filesystem", "/path"]
  env: {}
  scope: "user"
```

### Step 4: Choose Scope

- **user** -- `~/.config/slop-mcp/config.kdl` -- use for servers you want everywhere
- **project** -- `.slop-mcp.kdl` -- use for project-specific servers
- **memory** -- test first before persisting

### Step 5: Verify

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "list"
```

Check all servers appear and are connected.

### Step 6: Test a Tool

```
mcp__plugin_slop-mcp_slop-mcp__search_tools
  query: "read"
```

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "filesystem"
  tool_name: "read_file"
  parameters: { "path": "/etc/hostname" }
```

## KDL Config Format

After migration with `scope: "user"`, your `~/.config/slop-mcp/config.kdl` will look like:

```kdl
mcp "filesystem" {
  command "npx"
  args "-y" "@modelcontextprotocol/server-filesystem" "/home/user"
}

mcp "lci" {
  command "npx"
  args "-y" "@standardbeagle/lci@latest" "mcp"
}

mcp "github" {
  command "npx"
  args "-y" "@modelcontextprotocol/server-github"
  env {
    GITHUB_TOKEN "${GITHUB_TOKEN}"
  }
}
```

## Troubleshooting

### Server Won't Connect
- Verify the command exists: `which npx`
- Try running the command directly in a terminal
- Check `manage_mcps` with `action: "status"` and the server name

### Duplicate Server Name
- `manage_mcps` will reject a registration if the name already exists
- Use `action: "unregister"` first, then re-register

### Environment Variables
- Pass env vars in the `env` parameter when registering
- For secrets, set them in your shell environment and reference them in KDL config

### Rollback
- Unregister servers: `manage_mcps` with `action: "unregister"` and the server name
- Delete KDL config file to remove all persistent registrations
- Original config files are never modified

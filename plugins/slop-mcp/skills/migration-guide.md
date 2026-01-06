---
name: migration-guide
description: Guide for migrating MCP configurations to SLOP management
---

# MCP to SLOP Migration Guide

Complete guide for migrating existing MCP server configurations to SLOP-based management.

## Why Migrate to SLOP?

1. **Unified Interface** - Single REST API for all MCP servers
2. **Tool Discovery** - Search across all servers at once
3. **Resource Aggregation** - Unified resource namespace
4. **Session Management** - Persistent memory across tools
5. **Easier Scripting** - REST endpoints vs stdio pipes

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

### VS Code MCP Extension

Location: `.vscode/mcp.json` or workspace settings

Format:
```json
{
  "servers": {
    "myserver": {
      "command": "node",
      "args": ["./server.js"]
    }
  }
}
```

### Cursor

Location: `~/.cursor/mcp.json`

Format similar to Claude Desktop.

## Migration Steps

### Step 1: Initialize SLOP

```bash
/slop-init
```

Creates ~/slop-mcp/ with default configuration.

### Step 2: Backup Existing Configs

```bash
cp ~/.config/claude/claude_desktop_config.json ~/slop-mcp/migrations/claude-$(date +%Y%m%d).json
```

### Step 3: Run Migration

```bash
# Auto-detect all sources
/slop-migrate auto

# Or specific source
/slop-migrate claude-desktop
```

### Step 4: Verify Servers

```bash
/slop-list
```

Check all servers migrated correctly.

### Step 5: Test Execution

```bash
/slop-exec filesystem.list_directory path=/home
```

## Post-Migration Configuration

### Enable/Disable Servers

Edit ~/slop-mcp/config/slop.yaml:

```yaml
servers:
  - name: filesystem
    enabled: true   # Change to false to disable

  - name: github
    enabled: false  # Disabled by default
```

### Add Environment Variables

```yaml
servers:
  - name: github
    command: npx
    args: ["-y", "@modelcontextprotocol/server-github"]
    env:
      GITHUB_TOKEN: "${GITHUB_TOKEN}"  # Use env var
```

### Configure Logging

```yaml
logging:
  level: debug  # info, warn, error
  file: ~/slop-mcp/logs/slop.log
  max_size: 10M
  retain: 5
```

## Rollback

If migration fails:

1. Restore backup:
```bash
cp ~/slop-mcp/migrations/claude-YYYYMMDD.json ~/.config/claude/claude_desktop_config.json
```

2. Remove SLOP config:
```bash
rm -rf ~/slop-mcp
```

## Troubleshooting

### Server Won't Start
- Check command exists: `which npx`
- Verify args are correct
- Check env vars are set

### Tool Not Found
- Ensure server is enabled
- Check server started correctly
- View logs: `tail -f ~/slop-mcp/logs/slop.log`

### Permission Denied
- Check file permissions
- Verify env vars for API tokens

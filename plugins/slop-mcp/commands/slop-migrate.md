---
name: slop-migrate
description: Migrate existing MCP configurations to SLOP management
---

# Migrate MCP Configurations to SLOP

Migrate existing MCP server configurations from Claude Desktop, VS Code, or other MCP clients to SLOP management.

## Supported Sources

1. **Claude Desktop** - `~/.config/claude/claude_desktop_config.json` or `~/Library/Application Support/Claude/claude_desktop_config.json`
2. **VS Code** - `.vscode/mcp.json` or workspace settings
3. **Manual JSON** - Any MCP configuration file

## Migration Process

1. **Detect** existing MCP configurations
2. **Parse** server definitions (command, args, env)
3. **Validate** server configurations
4. **Convert** to SLOP format
5. **Backup** original configurations
6. **Update** ~/slop-mcp/config/slop.yaml

## SLOP Server Format

```yaml
servers:
  - name: filesystem
    command: npx
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/path"]
    env: {}
    enabled: true

  - name: lci
    command: npx
    args: ["-y", "@standardbeagle/lci@latest", "mcp"]
    env: {}
    enabled: true
```

## Usage

```
/slop-migrate [source]
```

Arguments:
- `source`: Path to MCP config file, or "claude-desktop", "vscode", "auto"

Examples:
- `/slop-migrate claude-desktop` - Migrate from Claude Desktop
- `/slop-migrate ./custom-mcp.json` - Migrate from custom file
- `/slop-migrate auto` - Auto-detect and migrate all sources

## Safety Features

- Creates backups in ~/slop-mcp/migrations/
- Validates servers before adding
- Detects duplicates by name or command
- Preserves environment variables

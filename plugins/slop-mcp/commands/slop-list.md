---
name: slop-list
description: List all MCP servers managed by SLOP
---

# List SLOP-Managed MCP Servers

Display all MCP servers registered with SLOP along with their status and capabilities.

## Output Format

```
SLOP MCP Servers
================

Server: filesystem
  Status: enabled
  Command: npx -y @modelcontextprotocol/server-filesystem /home/user
  Tools: read_file, write_file, list_directory, search_files
  Resources: file://*

Server: lci
  Status: enabled
  Command: npx -y @standardbeagle/lci@latest mcp
  Tools: search, get_context, find_files, code_insight
  Resources: none

Server: github [disabled]
  Status: disabled
  Command: npx -y @modelcontextprotocol/server-github
  Tools: (not loaded)
  Resources: (not loaded)
```

## Options

```
/slop-list [--format <format>] [--filter <status>]
```

| Option | Values | Description |
|--------|--------|-------------|
| `--format` | table, json, yaml | Output format (default: table) |
| `--filter` | all, enabled, disabled | Filter by status (default: all) |

## Examples

```bash
# List all servers
/slop-list

# List only enabled servers
/slop-list --filter enabled

# Export as JSON
/slop-list --format json

# Export as YAML for backup
/slop-list --format yaml > servers-backup.yaml
```

## Actions

After listing, you can:
- `/slop-exec <server> <tool>` - Execute a tool
- `/slop-search <query>` - Search across all tools
- Edit ~/slop-mcp/config/slop.yaml to enable/disable servers

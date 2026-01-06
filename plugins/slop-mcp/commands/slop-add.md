---
name: slop-add
description: Add an MCP server to SLOP management
---

# Add MCP Server to SLOP

Register a new MCP server with SLOP for unified management and execution.

## Quick Add Patterns

### NPX Package
```
/slop-add npx @namespace/package-name [args...]
```

### Local Binary
```
/slop-add /path/to/server [args...]
```

### Docker Container
```
/slop-add docker run image-name [args...]
```

### Python Package
```
/slop-add uvx package-name [args...]
```

## Full Syntax

```
/slop-add --name <name> --command <cmd> [--args <args>] [--env <KEY=VALUE>...] [--disabled]
```

## Options

| Option | Description |
|--------|-------------|
| `--name` | Unique server name (auto-generated if not provided) |
| `--command` | Server command (npx, uvx, binary path, docker) |
| `--args` | Command arguments (JSON array or space-separated) |
| `--env` | Environment variables (repeatable) |
| `--disabled` | Add but don't enable immediately |

## Examples

```bash
# Add filesystem server
/slop-add --name fs npx -y @modelcontextprotocol/server-filesystem /home/user

# Add with environment variables
/slop-add --name github npx -y @modelcontextprotocol/server-github --env GITHUB_TOKEN=xxx

# Add local server
/slop-add --name custom /usr/local/bin/my-mcp-server --args '["--port", "3000"]'
```

## After Adding

1. Server config added to ~/slop-mcp/config/servers/<name>.yaml
2. Server registered in ~/slop-mcp/config/slop.yaml
3. Use `/slop-list` to see all servers
4. Use `/slop-exec <name> <tool>` to call tools

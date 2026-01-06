---
name: slop-exec
description: Execute an MCP tool through SLOP
---

# Execute MCP Tool via SLOP

Execute any tool from any SLOP-managed MCP server using a unified interface.

## Usage

```
/slop-exec <server>.<tool> [arguments...]
/slop-exec <tool> [arguments...]  # Auto-discovers server
```

## Argument Formats

### Named Arguments
```
/slop-exec filesystem.read_file path=/etc/hosts
```

### JSON Arguments
```
/slop-exec lci.search '{"pattern": "function", "max": 10}'
```

### Positional (if tool supports)
```
/slop-exec filesystem.read_file /etc/hosts
```

## Examples

```bash
# Read a file
/slop-exec filesystem.read_file path=/home/user/README.md

# Search code
/slop-exec lci.search pattern="TODO" max=20

# Get GitHub issues
/slop-exec github.list_issues owner=anthropics repo=claude-code state=open

# Execute with JSON
/slop-exec brave.search '{"query": "MCP protocol", "count": 5}'
```

## Auto-Discovery

If server is not specified, SLOP searches all servers for the tool:

```bash
# These are equivalent if only filesystem has read_file
/slop-exec filesystem.read_file path=/etc/hosts
/slop-exec read_file path=/etc/hosts
```

If multiple servers have the same tool name, you'll be prompted to choose.

## SLOP Integration

Executes via SLOP's `/tools` endpoint:

```
POST /tools
{
  "tool": "filesystem.read_file",
  "arguments": {"path": "/etc/hosts"}
}
```

## Output Handling

- Text results displayed directly
- JSON results pretty-printed
- Binary results saved to file
- Errors shown with context

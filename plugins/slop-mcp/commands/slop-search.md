---
name: slop-search
description: Search tools and resources across all SLOP-managed MCP servers
---

# Search SLOP Tools and Resources

Search across all registered MCP servers for tools and resources matching your query.

## Usage

```
/slop-search <query> [--type <type>] [--server <name>]
```

## Options

| Option | Description |
|--------|-------------|
| `--type` | Filter by: tools, resources, all (default: all) |
| `--server` | Search only specific server |

## Examples

```bash
# Search for file-related tools
/slop-search file

# Search for search capabilities
/slop-search search --type tools

# Search specific server
/slop-search read --server filesystem
```

## Output

```
Search Results for "file"
=========================

Tools (5 matches):
  filesystem.read_file - Read contents of a file
  filesystem.write_file - Write content to a file
  filesystem.search_files - Search for files by pattern
  lci.find_files - Find files by name pattern
  github.get_file_contents - Get file from repository

Resources (2 matches):
  filesystem: file://* - Local filesystem access
  github: repo://*/files/* - Repository file access
```

## SLOP Integration

This command uses SLOP's `/tools` and `/resources` endpoints to aggregate capabilities from all managed servers.

```
GET /tools?q=file
GET /resources?q=file
```

Results are cached for performance. Use `--refresh` to force reload.

---
name: slop-search
description: Search tools across all slop-mcp managed MCP servers
---

# Search MCP Tools

Search across all registered MCP servers for tools matching a query.

## Tool Call

```
mcp__plugin_slop-mcp_slop-mcp__search_tools
  query: "<search-query>"
  mcp_name: "<server-name>"   # optional: filter to one server
  limit: 20                   # max results (default 20, max 100)
  offset: 0                   # pagination offset
```

## Steps

1. Ask the user what they are looking for if not provided as an argument.
2. Call `search_tools` with the query.
3. Present results showing tool name, server, and description.
4. If results are paginated (has_more is true), offer to load more.

## Getting Full Tool Details

For detailed schema of a specific tool:

```
mcp__plugin_slop-mcp_slop-mcp__get_metadata
  mcp_name: "<server-name>"
  tool_name: "<tool-name>"
  verbose: true
```

## Related Commands

- `/slop-exec` -- execute a found tool
- `/slop-list` -- see all registered servers

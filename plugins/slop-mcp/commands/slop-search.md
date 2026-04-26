---
name: slop-search
description: "Search tools across all slop-mcp registered MCP servers by keyword query. 跨所有已注冊 MCP 服務器搜索工具。 Use when: finding the right tool for a task, exploring available capabilities, filtering by server."
---

# Search MCP Tools

跨所有已注冊 MCP 服務器搜索匹配查詢之工具。

## Tool Call

```
mcp__plugin_slop-mcp_slop-mcp__search_tools
  query: "<search-query>"
  mcp_name: "<server-name>"   # optional: filter to one server
  limit: 20                   # max results (default 20, max 100)
  offset: 0                   # pagination offset
```

## Steps

1. 若未作為參數提供，詢問用戶所需。
2. 以查詢調用 `search_tools`。
3. 展示結果，含工具名、服務器及描述。
4. 若結果分頁（has_more 為 true），提示加載更多。

## Getting Full Tool Details

取特定工具詳細 schema：

```
mcp__plugin_slop-mcp_slop-mcp__get_metadata
  mcp_name: "<server-name>"
  tool_name: "<tool-name>"
  verbose: true
```

## Related Commands

- `/slop-exec` -- 執行已找到之工具
- `/slop-list` -- 查所有已注冊服務器

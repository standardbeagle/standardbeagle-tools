---
name: slop-list
description: List all registered slop-mcp MCP servers with connection status and available tools. 列所有已注冊 slop-mcp 服務器，含連接狀態與可用工具。 Use when: checking what servers are registered, verifying connection health, getting an overview before tool search.
---

# List slop-mcp Servers

顯示所有已注冊 MCP 服務器及其狀態。

## Tool Call

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "list"
```

取特定服務器詳細信息：

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "status"
  name: "<server-name>"
```

## Displaying Results

以清晰格式呈現服務器列表，顯示：
- 服務器名
- 連接狀態
- 傳輸類型（command/sse/streamable）
- 命令或 URL

對每個已連接服務器，可選調用 `get_metadata` 顯示可用工具：

```
mcp__plugin_slop-mcp_slop-mcp__get_metadata
  mcp_name: "<server-name>"
```

## Related Commands

- `/slop-add` -- 注冊新服務器
- `/slop-search` -- 跨所有服務器搜索工具
- `/slop-exec` -- 在服務器執行工具

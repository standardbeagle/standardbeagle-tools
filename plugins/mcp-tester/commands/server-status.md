---
name: server-status
description: "Show status of connected MCP servers and debug session statistics. 顯連接MCP伺服器狀態及除錯統計。 Use when: check mcp status, list connected servers, mcp session stats, show server health, mcp connection status"
---

# MCP Server Status

查所有已連 MCP 伺服器及除錯工作階段狀態。

## Instructions

1. 先以 `mcp-debug` MCP 伺服器之 `debug_status` 工具取得：
   - 除錯緩衝用量（已存訊息數/容量）
   - 請求與回應總計數
   - 工作階段運行時間及統計

2. 再以 `server_list` 取得：
   - 所有已連伺服器
   - 各伺服器連線狀態
   - 各伺服器可用工具

3. 呈現清晰狀態報告，含：
   - 整體除錯工作階段健康
   - 各已連伺服器：
     - 名稱及前綴
     - 連線狀態（connected/disconnected/error）
     - 可用工具數
     - 任何錯誤訊息

4. 若任何伺服器有問題，建議排障步驟。

## Example Output Format

```
Debug Session Status
====================
Buffer: 45/500 messages (9% used)
Requests: 123 | Responses: 120
Session uptime: 15m 32s

Connected Servers
=================
filesystem (fs_*)     : connected, 5 tools
myserver (myserver_*) : connected, 12 tools
broken-server         : error - "connection refused"
```

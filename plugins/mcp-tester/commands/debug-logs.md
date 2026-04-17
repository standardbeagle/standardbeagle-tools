---
name: debug-logs
description: "View recent MCP protocol JSON-RPC messages for debugging. 覽近期MCP協議JSON-RPC訊息以除錯。 Use when: view mcp logs, show mcp messages, debug mcp traffic, inspect json-rpc log, tail mcp protocol"
arguments:
  - name: server
    description: Filter logs to specific server (optional)
    required: false
  - name: direction
    description: Filter by direction - "request" or "response" (optional)
    required: false
  - name: limit
    description: Number of messages to show (default 20, max 500)
    required: false
---

# View MCP Debug Logs

查 mcp-debug 捕獲之近期 MCP 協定流量。

## Instructions

1. 以 `mcp-debug` MCP 伺服器之 `debug_logs` 工具，傳入：
   - `server`：{{server}}（若提供）
   - `direction`：{{direction}}（若提供——"request" 或 "response"）
   - `limit`：{{limit}}（若提供，否則預設 20）

2. 以清晰格式呈現日誌，顯示：
   - 時間戳
   - 方向（request/response）
   - 伺服器名
   - 訊息類型（tool_call、initialize 等）
   - 工具名（若適用）
   - 相關訊息內容

3. 若有錯誤或值得注意之規律，加以標示。

## Usage Examples

```
/debug-logs                        # Show last 20 messages from all servers
/debug-logs myserver               # Show messages for specific server
/debug-logs --direction request    # Show only requests
/debug-logs --limit 50             # Show more messages
```

## Tips

- 用此除錯工具呼叫失敗，理解請求/回應流程
- 除錯緩衝循環存至多 500 條訊息
- 配合 `debug_status` 查緩衝用量統計

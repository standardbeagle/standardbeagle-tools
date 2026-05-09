---
name: mcp-tester-send-raw
description: "\"Send raw JSON-RPC message to MCP server for low-level debugging. 發原始JSON-RPC訊息至MCP伺服器以底層除錯。 Use when: send raw mcp message, test json-rpc, low level mcp debug, craft custom mcp request, inject mcp message\""
disable-model-invocation: true
arguments: " - name: server description: Server name to send the message to required: true - name: message description: Raw JSON-RPC message to send required: true"
---

# Send Raw JSON-RPC Message

直接向 MCP 伺服器發送原始 JSON-RPC 訊息，供底層除錯。

## Instructions

1. 以 `mcp-debug` MCP 伺服器之 `debug_send` 工具，傳入：
   - `server`：{{server}}
   - `message`：{{message}}

2. 此操作不作驗證——慎用！

3. 發送後以 `debug_logs`（`limit: 5`）查看請求及任何回應。

4. 報告結果，含：
   - 訊息是否成功發送
   - 收到之任何回應
   - 任何錯誤或問題

## Example Usage

```
/send-raw myserver '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}'
```

## Warning

此操作繞過正常驗證。用於：
- 測試邊緣情況與錯誤處理
- 除錯協定問題
- 探索非標準 MCP 擴展

常規工具呼叫勿用此途——改用正常前綴工具。

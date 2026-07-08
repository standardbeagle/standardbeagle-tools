---
name: mcp-tester-debug-mcp-traffic
description: "Analyze MCP JSON-RPC traffic to diagnose protocol and tool call issues. 分析 MCP 協定流量，診斷請求/回應異常。 Use when: tool calls fail, debugging connection issues, inspecting request/response patterns."
disable-model-invocation: true
---

# Debugging MCP Protocol Traffic

助開發者以 mcp-debug 分析、除錯 MCP 協定流量。

## Understanding the Debug Buffer

mcp-debug 維護循環緩衝，存最近 500 條 JSON-RPC 訊息。每條含：
- 時間戳
- 方向（請求/回應）
- 伺服器名
- 訊息類型
- 完整 JSON-RPC 內容

## Debugging Techniques

### 1. View Recent Traffic

```
Use debug_logs tool:
- limit: 20 (default)
- server: (optional - filter to specific server)
- direction: (optional - "request" or "response")
```

### 2. Diagnose Tool Call Failures

工具呼叫失敗時：

1. **取近期日誌**
   ```
   debug_logs with limit: 10
   ```

2. **尋找：**
   - 含失敗工具呼叫之請求
   - 含錯誤詳情之回應
   - 缺失回應（逾時問題）
   - 格式錯誤之請求

3. **查請求結構：**
   - 方法名正確
   - 合法 JSON-RPC 格式
   - 必要參數齊全

### 3. Debug Connection Issues

```
Use debug_status tool to see:
- Buffer usage (indicates activity level)
- Request/response counts (mismatches indicate lost messages)
- Server connection states
```

### 4. Analyze Specific Server

```
debug_logs with:
- server: "myserver"
- limit: 50
```

尋規律：
- 慢回應（查時間戳）
- 錯誤模式
- 異常訊息序列

## Common Issues and Solutions

### No Response to Tool Calls
- 查伺服器已連：`server_list`
- 於日誌中尋伺服器錯誤
- 驗伺服器無阻塞/死鎖

### Invalid JSON-RPC Errors
- 以 `schema_validate` 查工具模式
- 於 debug_logs 查請求格式
- 驗參數型別符合模式

### Timeout Issues
- 查日誌中時間戳間隔
- 驗伺服器非耗時運算
- 考慮提高配置中逾時值

### Unexpected Tool Behavior
- 比對日誌中請求參數與預期
- 查工具模式是否更改
- 驗正確工具前綴被使用

## Advanced: Raw Message Testing

邊緣情況可用 `debug_send` 發原始 JSON-RPC：

```
debug_send with:
- server: "myserver"
- message: '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}'
```

繼以 `debug_logs` 查回應。

## Session Statistics

`debug_status` 提供：
- 緩衝容量用量
- 訊息總計數
- 可偵測訊息不平衡（訊息遺失）

## Related

- `mcp-tester:debug-logs` — 覽/篩原始 JSON-RPC 訊息（分析之前置）。

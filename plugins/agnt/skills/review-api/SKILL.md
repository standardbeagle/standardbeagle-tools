---
name: agnt-review-api
description: "\"Review API calls, responses, and network traffic. 審API調用響應網絡流量. Use when: inspect API calls, review network requests, check API responses, analyze request payload, debug API issues\""
allowed-tools: "[\"mcp__agnt__proxy\", \"mcp__agnt__proxylog\", \"mcp__agnt__currentpage\"]"
---

審查agnt代理捕獲之API呼叫與網路流量。

## 步驟

### 1. 取頁面Session概覽
```
currentpage {proxy_id: "dev"}
```

### 2. 列出所有HTTP流量
```
proxylog {proxy_id: "dev", types: ["http"], limit: 50}
```

### 3. 僅篩選API呼叫
```
proxylog {proxy_id: "dev", types: ["http"], url_pattern: "/api/", limit: 30}
```

### 4. 查失敗請求
```
proxylog {proxy_id: "dev", types: ["http"], status_codes: [400, 401, 403, 404, 500, 502, 503], limit: 20}
```

### 5. 捕獲網路效能
```
proxy {action: "exec", id: "dev", code: "__devtool.captureNetwork()"}
```

### 6. 審查自訂日誌（API除錯訊息）
```
proxylog {proxy_id: "dev", types: ["custom"], limit: 20}
```

## 篩選HTTP流量

### 按方法
```
proxylog {proxy_id: "dev", types: ["http"], methods: ["POST"], limit: 20}
proxylog {proxy_id: "dev", types: ["http"], methods: ["GET"], limit: 20}
proxylog {proxy_id: "dev", types: ["http"], methods: ["PUT", "DELETE"], limit: 20}
```

### 按URL模式
```
proxylog {proxy_id: "dev", types: ["http"], url_pattern: "/api/users", limit: 20}
proxylog {proxy_id: "dev", types: ["http"], url_pattern: "/graphql", limit: 20}
proxylog {proxy_id: "dev", types: ["http"], url_pattern: ".json", limit: 20}
```

### 按狀態碼
```
// Success only
proxylog {proxy_id: "dev", types: ["http"], status_codes: [200, 201], limit: 20}

// Client errors
proxylog {proxy_id: "dev", types: ["http"], status_codes: [400, 401, 403, 404], limit: 20}

// Server errors
proxylog {proxy_id: "dev", types: ["http"], status_codes: [500, 502, 503, 504], limit: 20}
```

### 按時間範圍
```
proxylog {proxy_id: "dev", types: ["http"], since: "5m", limit: 20}
proxylog {proxy_id: "dev", types: ["http"], since: "1h", limit: 50}
```

## HTTP日誌條目欄位

每個HTTP日誌條目含：

| Field | Description |
|-------|-------------|
| `method` | HTTP方法（GET, POST等） |
| `url` | 請求URL |
| `status` | 回應狀態碼 |
| `duration` | 請求時長（毫秒） |
| `request_headers` | 請求標頭 |
| `response_headers` | 回應標頭 |
| `request_body` | 請求主體（大時截斷） |
| `response_body` | 回應主體（大時截斷） |
| `timestamp` | 請求時間 |

## 網路效能分析

`captureNetwork()` 提供：

```
proxy {action: "exec", id: "dev", code: "__devtool.captureNetwork()"}
```

每個資源回傳：
- `name`：URL
- `type`：initiator（script、fetch、xhr、img、css）
- `duration`：載入時間（毫秒）
- `size`：傳輸大小（位元組）
- `startTime`：開始載入時間

## API品質清單

### 回應品質
- [ ] 所有端點回傳適當狀態碼
- [ ] 錯誤回應含有助益訊息
- [ ] 回應時間可接受（< 500ms）
- [ ] 大量資料已分頁

### 安全性
- [ ] 需要時有身份驗證
- [ ] URL中無敏感資料
- [ ] CORS標頭設定正確
- [ ] 回應主體中無憑證

### 最佳實踐
- [ ] 一致回應格式（JSON）
- [ ] 適當HTTP方法（讀取用GET，建立用POST）
- [ ] 適當快取標頭
- [ ] Content-Type標頭正確

## 除錯API問題

```
// Log custom API debug message
proxy {action: "exec", id: "dev", code: "__devtool.log('API Debug', 'info', {endpoint: '/api/users', issue: 'slow response'})"}

// Capture current application state
proxy {action: "exec", id: "dev", code: "__devtool.captureState()"}

// Check for CORS or fetch errors
proxylog {proxy_id: "dev", types: ["error"], limit: 10}
```

## 取流量統計
```
proxylog {proxy_id: "dev", action: "stats"}
```

按類型回傳計數與整體統計。

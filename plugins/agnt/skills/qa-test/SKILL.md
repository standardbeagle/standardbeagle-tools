---
name: agnt-qa-test
description: "\"Comprehensive QA testing suite for current page. 全面品保測試現頁. Use when: run QA tests, validate page functionality, test user flows, check for broken features, comprehensive page verification\""
disable-model-invocation: true
allowed-tools: "[\"mcp__agnt__proxy\", \"mcp__agnt__proxylog\", \"mcp__agnt__currentpage\"]"
context: fork
agent: "agnt:browser-debugger"
---

<!-- CC 2.1 fork decision: workflow driver (multi-step QA pipeline with several diagnostic calls). Forking keeps the parent loop free of intermediate proxy/proxylog output. Executor agent: agnt:browser-debugger (preloads browser-debug, browser-diagnostics, error-monitor, mcp-tools). -->


藉agnt診斷工具對當前頁面執行完整QA測試套件。

## 步驟

### 1. 頁面品質檢查
```
proxy {action: "exec", id: "dev", code: "__devtool.auditPageQuality()"}
```

### 2. 無障礙稽核
```
proxy {action: "exec", id: "dev", code: "__devtool.auditAccessibility()"}
```

### 3. 安全稽核
```
proxy {action: "exec", id: "dev", code: "__devtool.auditSecurity()"}
```

### 4. DOM複雜度檢查
```
proxy {action: "exec", id: "dev", code: "__devtool.auditDOMComplexity()"}
```

### 5. CSS品質檢查
```
proxy {action: "exec", id: "dev", code: "__devtool.auditCSS()"}
```

### 6. 查JavaScript錯誤
```
proxylog {proxy_id: "dev", types: ["error"], limit: 50}
```

### 7. 審查HTTP請求錯誤
```
proxylog {proxy_id: "dev", types: ["http"], status_codes: [400, 401, 403, 404, 500, 502, 503], limit: 20}
```

### 8. 取頁面Session概覽
```
currentpage {proxy_id: "dev"}
```

### 9. 捕獲測試證據
```
proxy {action: "exec", id: "dev", code: "__devtool.screenshot('qa-test')"}
```

## QA測試類別

### 功能測試

| Test | Command |
|------|---------|
| 查所有表單 | `document.querySelectorAll('form').length` |
| 查所有按鈕 | `__devtool.interactions.getHistory()` |
| 驗證導航 | `document.querySelectorAll('a[href]').length` |
| 測試用戶流程 | 審查互動歷史 |

### 視覺測試

| Test | Command |
|------|---------|
| 佈局問題 | `__devtool.findOverflows()` |
| 隱藏內容 | `__devtool.findOffscreen()` |
| Z-index問題 | `__devtool.findStackingContexts()` |
| 截圖 | `__devtool.screenshot('test-name')` |

### 效能測試

| Test | Command |
|------|---------|
| 網路資源 | `__devtool.captureNetwork()` |
| DOM大小 | `__devtool.auditDOMComplexity()` |
| 載入指標 | `proxylog {types: ["performance"]}` |

### 錯誤偵測

| Test | Command |
|------|---------|
| JS錯誤 | `proxylog {types: ["error"]}` |
| 控制台警告 | `proxylog {types: ["custom"]}` |
| 失敗請求 | `proxylog {types: ["http"], status_codes: [4xx, 5xx]}` |

## 互動式QA命令

```
// Track all user interactions during testing
proxy {action: "exec", id: "dev", code: "__devtool.interactions.getHistory()"}

// Monitor DOM changes (catches unexpected UI updates)
proxy {action: "exec", id: "dev", code: "__devtool.mutations.getHistory()"}

// Highlight recently changed elements
proxy {action: "exec", id: "dev", code: "__devtool.mutations.highlightRecent(10000)"}

// Check specific element visibility
proxy {action: "exec", id: "dev", code: "__devtool.isVisible('#submit-button')"}

// Verify element is in viewport
proxy {action: "exec", id: "dev", code: "__devtool.isInViewport('#important-content')"}

// Check element overlap (z-index issues)
proxy {action: "exec", id: "dev", code: "__devtool.checkOverlap('#element1', '#element2')"}
```

## QA清單

### 關鍵（P0）
- [ ] 無JavaScript錯誤
- [ ] 無4xx/5xx HTTP錯誤
- [ ] 所有表單正確提交
- [ ] 身份驗證正常
- [ ] 核心用戶流程完整

### 高優先（P1）
- [ ] 無障礙稽核通過
- [ ] 安全稽核通過
- [ ] 行動裝置響應式
- [ ] 跨瀏覽器測試
- [ ] 效能可接受

### 中優先（P2）
- [ ] SEO稽核通過
- [ ] 所有圖片載入
- [ ] 連結正常（無404）
- [ ] 邊緣案例已處理
- [ ] 錯誤訊息有助益

### 低優先（P3）
- [ ] CSS整潔
- [ ] 無控制台警告
- [ ] 動畫流暢
- [ ] 微互動正常
- [ ] 分析追蹤正常

## 迴歸測試

變更後比較前後：

```
// Capture current state
proxy {action: "exec", id: "dev", code: "__devtool.captureState()"}

// Take baseline screenshot
proxy {action: "exec", id: "dev", code: "__devtool.screenshot('regression-baseline')"}

// After changes, compare
proxy {action: "exec", id: "dev", code: "__devtool.screenshot('regression-after')"}
```

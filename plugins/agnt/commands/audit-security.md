---
description: "Audit page for security vulnerabilities and best practices. 審頁面安全漏洞最佳法. Use when: check security issues, find XSS vulnerabilities, audit CSP headers, review auth flows, scan for security risks"
allowed-tools: ["mcp__agnt__proxy", "mcp__agnt__proxylog"]
context: fork
agent: agnt:browser-debugger
---

<!-- CC 2.1 fork decision: workflow driver (CSP/header inspection, XSS probes, auth review = multi-step). Fork keeps parent loop free of audit verbosity. Executor: agnt:browser-debugger. -->


藉agnt診斷工具稽核當前頁面之安全漏洞。

## 步驟

1. 執行安全稽核：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.auditSecurity()"}
   ```

2. 查JavaScript錯誤（可能指示安全問題）：
   ```
   proxylog {proxy_id: "dev", types: ["error"], limit: 20}
   ```

3. 捕獲頁面狀態以審查cookie與儲存：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.captureState()"}
   ```

4. 截圖存檔：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.screenshot('security-audit')"}
   ```

## 稽核檢查內容

### 嚴重安全問題（錯誤）

| Issue | Description |
|-------|-------------|
| `mixed-content` | HTTPS頁面載入HTTP資源（阻擋安全內容） |
| `insecure-form` | 表單提交至HTTP URL（憑證外洩） |

### 安全警告

| Issue | Description |
|-------|-------------|
| `missing-noopener` | `target="_blank"` 連結無 `rel="noopener"`（標籤劫持風險） |
| `password-autocomplete` | 密碼欄位啟用自動完成 |

## 解讀結果

稽核回傳：
- `issues`：找到之安全漏洞陣列
- `count`：問題總數
- `errors`：嚴重安全問題
- `warnings`：非嚴重安全顧慮

混合內容問題中，`resources` 陣列顯示：
- `type`：資源類型（script、stylesheet、image）
- `url`：不安全HTTP URL

## 狀態捕獲審查

`captureState()` 揭露：

### Cookie
- 查敏感cookie之 `HttpOnly` 旗標
- 驗證HTTPS站點之 `Secure` 旗標
- 尋找session令牌或敏感資料

### Local/Session Storage
- 識別客戶端儲存之資料
- 尋找令牌、憑證或PII
- 查應在伺服器端之敏感資料

## 附加安全檢查

```
// Check Content Security Policy
proxy {action: "exec", id: "dev", code: "document.querySelector('meta[http-equiv=\"Content-Security-Policy\"]')?.content"}

// Find all forms and their actions
proxy {action: "exec", id: "dev", code: "Array.from(document.forms).map(f => ({action: f.action, method: f.method}))"}

// Find all scripts (check for untrusted sources)
proxy {action: "exec", id: "dev", code: "Array.from(document.scripts).map(s => s.src).filter(s => s)"}

// Check for inline event handlers (XSS risk)
proxy {action: "exec", id: "dev", code: "document.querySelectorAll('[onclick], [onerror], [onload]').length"}
```

## 安全最佳實踐清單

- [ ] 所有資源透過HTTPS載入
- [ ] 表單提交至HTTPS端點
- [ ] 外部連結含 `rel="noopener noreferrer"`
- [ ] 敏感cookie有 `HttpOnly` 與 `Secure` 旗標
- [ ] localStorage中無憑證
- [ ] Content Security Policy標頭已設定
- [ ] X-Frame-Options或CSP frame-ancestors已設定
- [ ] 所有用戶輸入有輸入驗證
- [ ] 無內聯事件處理器（onclick等）
- [ ] 第三方腳本來自可信來源

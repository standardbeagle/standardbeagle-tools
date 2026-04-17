---
description: "Debug browser issues using agnt diagnostic tools. 用診斷工具除瀏覽器患. Use when: debug browser problems, diagnose page issues, use agnt diagnostics, inspect browser state, troubleshoot frontend bugs"
allowed-tools: ["mcp__agnt__proxy", "mcp__agnt__proxylog", "mcp__agnt__currentpage"]
---

藉agnt診斷工具進行完整瀏覽器除錯。

## 步驟

1. 取當前頁面session概覽：
   ```
   currentpage {proxy_id: "dev"}
   ```
   顯示：活動頁面、資源計數、錯誤計數、互動/變動計數。

2. 查JavaScript錯誤：
   ```
   proxylog {proxy_id: "dev", types: ["error"], limit: 10}
   ```

3. 查近期用戶互動（助理解用戶流程）：
   ```
   proxylog {proxy_id: "dev", types: ["interaction"], limit: 10}
   ```

4. 查DOM變動（助除錯動態UI問題）：
   ```
   proxylog {proxy_id: "dev", types: ["mutation"], limit: 10}
   ```

5. 若用戶回報點擊了某處：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.interactions.getLastClickContext()"}
   ```
   回傳最後點擊之詳細上下文：元素、祖先、文字內容、位置。

6. 視覺高亮近期DOM變更：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.mutations.highlightRecent(5000)"}
   ```
   高亮最後5秒內變更之元素。

7. 無障礙問題：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.auditAccessibility()"}
   ```

8. CSS/佈局問題：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.findOverflows()"}
   ```

9. 檢測特定元素：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.inspect('#element-selector')"}
   ```

依據發現，建議修復方案並向用戶解釋問題。

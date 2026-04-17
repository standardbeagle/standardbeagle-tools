---
description: "Check for JavaScript errors in the browser. 查瀏覽器JavaScript錯誤. Use when: find JS errors, check console errors, debug browser exceptions, review error log, diagnose script failures"
allowed-tools: ["mcp__agnt__proxylog", "mcp__agnt__proxy"]
---

查agnt代理捕獲之JavaScript錯誤。

## 步驟

1. 查代理日誌中之錯誤條目：
   ```
   proxylog {proxy_id: "dev", types: ["error"], limit: 20}
   ```

2. 若有錯誤：
   - 彙整每個錯誤之訊息、檔案、行號、欄號
   - 若錯誤眾多，按類型分組
   - 建議常見錯誤模式之修復方案

3. 若未找到錯誤：
   - 確認頁面無錯誤
   - 建議用戶可透過與頁面互動觸發錯誤

4. 可選：查可能指示問題之自訂日誌：
   ```
   proxylog {proxy_id: "dev", types: ["custom"], limit: 10}
   ```

注：代理ID "dev" 為預設值。若用戶有不同代理在運行，應指定其ID。

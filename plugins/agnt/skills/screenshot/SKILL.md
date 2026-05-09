---
name: agnt-screenshot
description: "\"Take screenshot of current browser page. 截取現瀏覽頁圖. Use when: screenshot page, capture current view, take page snapshot, document visual state, capture browser output\""
allowed-tools: "[\"mcp__agnt__proxy\", \"mcp__agnt__proxylog\"]"
---

從代理瀏覽器頁面截圖。

## 步驟

1. 在瀏覽器執行截圖函數：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.screenshot('screenshot')"}
   ```

2. 短暫等待截圖捕獲並傳送。

3. 查日誌取截圖條目：
   ```
   proxylog {proxy_id: "dev", types: ["screenshot"], limit: 1}
   ```

4. 截圖日誌條目含：
   - `image_path`：PNG檔案路徑
   - `timestamp`：截圖時間

5. 向用戶回報截圖路徑。可用任何圖片檢視器查看。

注：若無瀏覽器連接至代理，此操作將失敗。確保用戶已在瀏覽器開啟代理URL。

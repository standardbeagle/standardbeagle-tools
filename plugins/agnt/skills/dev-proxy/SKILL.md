---
name: agnt-dev-proxy
description: "\"Start dev server with reverse proxy for browser debugging. 啟開發服務器反向代理以調試瀏覽器. Use when: start dev proxy, set up reverse proxy, enable browser debugging, intercept network traffic, local dev with proxy\""
allowed-tools: "[\"mcp__agnt__detect\", \"mcp__agnt__run\", \"mcp__agnt__proxy\", \"mcp__agnt__proc\"]"
---

啟動含agnt反向代理之開發伺服器供瀏覽器除錯。

## 步驟

1. 先偵測專案類型以尋找可用腳本：
   ```
   detect {path: "."}
   ```

2. 以背景模式啟動開發伺服器（找「dev」、「start」或「serve」腳本）：
   ```
   run {script_name: "dev", mode: "background"}
   ```

3. 等3-5秒待伺服器啟動，再啟動代理：
   ```
   proxy {action: "start", id: "dev", target_url: "http://localhost:3000"}
   ```
   注：根據開發伺服器實際使用埠調整。

4. 向用戶回報代理URL以在瀏覽器開啟。

5. 說明代理提供：
   - JavaScript錯誤捕獲
   - 效能指標
   - DOM變動追蹤
   - 用戶互動日誌
   - 診斷用之 `__devtool` API
   - 發送訊息給代理用之浮動指示器
   - 線框用之草圖模式

用戶現可在瀏覽器開啟代理URL取得瀏覽器超能力。

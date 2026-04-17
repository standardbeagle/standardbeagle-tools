---
description: "Get comprehensive information about the current page the user is browsing. 取用戶所瀏覽頁之詳情. Use when: inspect current page, get page details, read page content, check active URL, understand current browser context"
allowed-tools: ["mcp__agnt__proxy", "mcp__agnt__proxylog", "mcp__agnt__get_errors"]
---

透過agnt瀏覽器整合取當前瀏覽器頁面完整資訊。

## 步驟

1. 先查錯誤：
   ```
   get_errors {proxy_id: "dev", include_warnings: false}
   ```

2. 取頁面基本資訊（URL、標題、視窗、捲動）：
   ```
   proxy {action: "exec", id: "dev", code: "({ url: window.location.href, title: document.title, viewport: { width: window.innerWidth, height: window.innerHeight, scrollX: window.scrollX, scrollY: window.scrollY } })"}
   ```

3. 提取頁面內容為Markdown：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool_content.extractContent()"}
   ```
   回傳：`url`, `title`, `markdown`, `meta`, `headings`, `wordCount`。

4. 取導航結構：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool_content.extractNavigation()"}
   ```

5. 連結、結構化資料、效能、截圖或線框——詳見 **current-page** 技能。

依頁面內容、URL與標題彙整用戶當前所覽之概要。

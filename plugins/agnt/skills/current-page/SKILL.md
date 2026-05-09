---
name: agnt-current-page
description: "Extract comprehensive browser page info - URL, content, navigation, links, structured data, performance, visual state. 取瀏覽器當前頁面全覽：URL、內容、導航、連結、結構資料、效能、視覺狀態。 Use when: get current page, what page is user on, extract page content, page URL, page title, screenshot page"
---

# 當前頁面資訊技能

藉agnt瀏覽器整合提取完整頁面資訊。用此技能了解用戶瀏覽器當前所覽之頁。

## 前提條件

代理必須運行且瀏覽器已連接：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "start",
    "id": "dev",
    "target_url": "http://localhost:3000"
  }
}
```

---

## 快速概覽：取全頁資訊

**先檢查錯誤：**

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_errors",
  "parameters": {"proxy_id": "dev", "include_warnings": false}
}
```

再取頁面上下文：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "({ url: window.location.href, title: document.title, viewport: { width: window.innerWidth, height: window.innerHeight, scrollX: window.scrollX, scrollY: window.scrollY } })"
  }
}
```

---

## 頁面基本資訊

### URL與標題

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "({ href: window.location.href, origin: window.location.origin, pathname: window.location.pathname, title: document.title })"
  }
}
```

回傳：完整URL、來源、路徑、頁面標題。

### 視窗與捲動位置

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "({ viewport: { width: window.innerWidth, height: window.innerHeight, devicePixelRatio: window.devicePixelRatio }, scroll: { x: window.scrollX, y: window.scrollY, maxScrollX: document.documentElement.scrollWidth - window.innerWidth, maxScrollY: document.documentElement.scrollHeight - window.innerHeight } })"
  }
}
```

---

## 內容提取

### 頁面內容轉Markdown

提取主內容並格式化為Markdown：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_content.extractContent()"
  }
}
```

**選項：**
- `selector` — 內容區CSS選擇器（未提供則自動偵測）
- `includeImages` — 含圖片引用（預設：true）
- `includeLinks` — 含連結URL（預設：true）
- `maxLength` — 最大內容長度（預設：50000）

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_content.extractContent({ selector: 'article', maxLength: 10000 })"
  }
}
```

回傳：
- `url` — 頁面URL
- `title` — 頁面標題
- `markdown` — Markdown格式內容
- `meta` — Meta描述、關鍵字、作者、OpenGraph
- `headings` — 標題層次結構（level, text, id）
- `wordCount` — 估算字數
- `truncated` — 是否被截斷

### 標題層次結構

取文件大綱結構：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_content.extractHeadings()"
  }
}
```

回傳：所有h1-h6元素之 `{ level, text, id }` 陣列。

### Meta標籤

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "({ description: document.querySelector('meta[name=\"description\"]')?.content, keywords: document.querySelector('meta[name=\"keywords\"]')?.content, author: document.querySelector('meta[name=\"author\"]')?.content, viewport: document.querySelector('meta[name=\"viewport\"]')?.content, charset: document.characterSet, lang: document.documentElement.lang })"
  }
}
```

---

## 導航結構

### 提取完整導航

取所有導航元素、麵包屑、header/footer導航：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_content.extractNavigation()"
  }
}
```

回傳：
- `navElements` — 所有 `<nav>` 元素含嵌套結構
- `header` — Header導航連結
- `footer` — Footer導航連結
- `breadcrumbs` — 麵包屑路徑（若有）
- `sidebar` — 側欄導航（若有）

### 麵包屑

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_content.extractNavigation().breadcrumbs"
  }
}
```

---

## 連結

### 含上下文之所有連結

提取並分類所有連結：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_content.extractLinks()"
  }
}
```

回傳：
- `internal` — 同來源連結
- `external` — 外部域名連結
- `anchors` — 同頁錨點連結
- `mailto` — 電子郵件連結
- `tel` — 電話連結
- `stats` — 各分類計數

每個連結含：`href`, `url`, `text`, `title`, `ariaLabel`, `selector`, `inNav`, `inFooter`, `inHeader`, `rel`。

### 篩選連結

僅內部連結：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_content.extractLinks({ internal: true })"
  }
}
```

含錨點連結，限定範圍：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_content.extractLinks({ includeAnchors: true, selector: '.sidebar' })"
  }
}
```

---

## 結構化資料

### JSON-LD、OpenGraph、Twitter Cards

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_content.extractStructuredData()"
  }
}
```

回傳：
- `jsonLd` — 解析後之JSON-LD結構化資料
- `openGraph` — 所有 `og:*` meta標籤
- `twitter` — 所有 `twitter:*` meta標籤

### 僅OpenGraph

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_content.extractStructuredData().openGraph"
  }
}
```

---

## 效能指標

效能指標由agnt自動捕獲。查閱代理日誌：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxylog",
  "parameters": {
    "proxy_id": "dev",
    "types": ["performance"]
  }
}
```

### 手動效能檢查

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "(function() { var perf = window.performance; var timing = perf && perf.timing; if (!timing) return { error: 'Performance timing not available' }; return { navigationStart: timing.navigationStart, domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart, loadComplete: timing.loadEventEnd - timing.navigationStart, domInteractive: timing.domInteractive - timing.navigationStart, domComplete: timing.domComplete - timing.navigationStart }; })()"
  }
}
```

回傳：毫秒單位之導航時序指標。

### 繪製時序（FCP, FP）

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "(function() { var entries = performance.getEntriesByType('paint'); var result = {}; entries.forEach(function(e) { result[e.name] = Math.round(e.startTime); }); return result; })()"
  }
}
```

---

## DOM統計

### 文件大小

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "({ elementCount: document.querySelectorAll('*').length, bodyHTML: document.body.innerHTML.length, depth: (function maxDepth(el, d) { if (!el.children.length) return d; return Math.max(...Array.from(el.children).map(c => maxDepth(c, d + 1))); })(document.body, 0) })"
  }
}
```

回傳：元素總數、HTML大小（位元組）、最大DOM深度。

### 表單與輸入

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "({ forms: document.forms.length, inputs: document.querySelectorAll('input, textarea, select').length, buttons: document.querySelectorAll('button').length })"
  }
}
```

---

## 視覺狀態

### 截圖

截取當前頁面：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "await __devtool.screenshot('current-page')"
  }
}
```

**選項：**
- `fullPage: true` — 捕獲整個可捲動頁面
- `selector: '.content'` — 捕獲特定元素
- `region: {x, y, width, height}` — 捕獲像素區域

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "await __devtool.screenshot({ name: 'full-page', fullPage: true })"
  }
}
```

### 線框圖

生成結構線框：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.generateWireframe({ viewportOnly: true })"
  }
}
```

---

## 完整頁面快照

一次取全部：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "({ basics: { url: window.location.href, title: document.title, viewport: { width: window.innerWidth, height: window.innerHeight } }, meta: { description: document.querySelector('meta[name=\"description\"]')?.content, keywords: document.querySelector('meta[name=\"keywords\"]')?.content }, headings: __devtool_content.extractHeadings().slice(0, 20), links: __devtool_content.extractLinks().stats, navigation: __devtool_content.extractNavigation().navElements.length > 0, structuredData: { jsonLd: __devtool_content.extractStructuredData().jsonLd.length, openGraph: Object.keys(__devtool_content.extractStructuredData().openGraph).length }, dom: { elements: document.querySelectorAll('*').length, forms: document.forms.length } })"
  }
}
```

---

## 快速參考

### 內容模組函數

| Function | Purpose |
|----------|---------|
| `extractContent(opts)` | 頁面內容轉Markdown |
| `extractHeadings(scope)` | 標題層次結構 |
| `extractNavigation()` | 所有導航結構 |
| `extractLinks(opts)` | 含上下文之分類連結 |
| `extractStructuredData()` | JSON-LD、OG、Twitter Cards |
| `buildSitemap(opts)` | 由內部連結建站點結構 |

### 常用選項

**extractContent：**
- `selector` — 內容區選擇器
- `includeImages` — 含圖片（預設：true）
- `includeLinks` — 含連結（預設：true）
- `maxLength` — 最大長度（預設：50000）

**extractLinks：**
- `internal` — 僅內部連結
- `external` — 僅外部連結
- `includeAnchors` — 含錨點
- `selector` — 限定至某元素

### 適用時機

- **「我在哪個頁面？」** → 基本URL/標題檢查
- **「此頁有什麼？」** → extractContent()
- **「顯示導航」** → extractNavigation()
- **「有哪些連結？」** → extractLinks()
- **「有結構化資料嗎？」** → extractStructuredData()
- **「頁面效能如何？」** → proxylog performance
- **「顯示視覺樣貌」** → screenshot()

---

## 相關技能

> Invoke the `Skill` tool with `skill: agnt:browser-debug` — 深查當前頁面問題：元素檢測、佈局診斷、互動追蹤、變動監控。

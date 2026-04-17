---
description: "Comprehensive frontend analysis including DOM, CSS, layout, and structure. 全面析前端含DOM樣式布局結構. Use when: analyze frontend code, inspect DOM structure, review CSS layout, audit page structure, diagnose rendering issues"
allowed-tools: ["mcp__agnt__proxy", "mcp__agnt__proxylog"]
---

藉agnt診斷工具對當前頁面執行完整前端分析。

## 步驟

1. 分析DOM複雜度：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.auditDOMComplexity()"}
   ```

2. 稽核CSS問題：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.auditCSS()"}
   ```

3. 找佈局溢出：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.findOverflows()"}
   ```

4. 找堆疊上下文（z-index層次）：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.findStackingContexts()"}
   ```

5. 捕獲完整頁面狀態：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.captureDOM()"}
   ```

6. 捕獲網路資源：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.captureNetwork()"}
   ```

7. 截圖：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.screenshot('frontend-analysis')"}
   ```

## DOM複雜度分析

`auditDOMComplexity()` 回傳：

| Metric | Healthy Range | Concern |
|--------|---------------|---------|
| `totalElements` | < 1500 | > 3000 影響效能 |
| `maxDepth` | < 20 | > 32 引起問題 |
| `duplicateIds` | 0 | 任何重複破壞JS/CSS |
| `scripts` | < 20 | > 50 減慢載入 |
| `stylesheets` | < 10 | > 20 阻擋渲染 |
| `iframes` | < 5 | 各增加開銷 |

## CSS分析

`auditCSS()` 檢查：

| Issue | Description | Impact |
|-------|-------------|--------|
| `excessive-inline-styles` | 大量元素含 `style=""` | 可維護性、快取 |
| `excessive-important` | 大量 `!important` 規則 | 特異性衝突 |

回傳：
- `inlineStyleCount`：含內聯樣式之元素數
- `importantCount`：使用!important之規則數
- `stylesheetCount`：總樣式表數

## 佈局分析

### 溢出
內容超出容器邊界之元素：
- 類型：`hidden`（內容被裁剪）或 `scrollable`
- 尺寸：捲動 vs 客戶端寬高

### 堆疊上下文
建立新z-index層之元素：
- 原因：定位、opacity、transform、filter

## 元素檢測命令

```
// Inspect a specific element comprehensively
proxy {action: "exec", id: "dev", code: "__devtool.inspect('#my-element')"}

// Get computed styles for an element
proxy {action: "exec", id: "dev", code: "__devtool.getComputed('#my-element')"}

// Get box model (margin, border, padding)
proxy {action: "exec", id: "dev", code: "__devtool.getBox('#my-element')"}

// Get flexbox/grid layout info
proxy {action: "exec", id: "dev", code: "__devtool.getLayout('#my-element')"}

// Get stacking context info
proxy {action: "exec", id: "dev", code: "__devtool.getStacking('#my-element')"}

// Walk DOM tree from element
proxy {action: "exec", id: "dev", code: "__devtool.walkChildren('#container', 3)"}
```

## 前端健康指標

### 良好
- DOM元素 < 1500
- 無重複ID
- 最少內聯樣式
- 極少!important宣告
- 邏輯z-index使用

### 需關注
- DOM元素1500-3000
- 部分內聯樣式（> 10）
- 若干!important規則
- 深嵌套（> 20層）

### 嚴重
- DOM元素 > 3000
- 存在重複ID
- 過多內聯樣式（> 50）
- 大量!important（> 10）
- 極深嵌套（> 32）

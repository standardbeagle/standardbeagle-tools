---
description: "Analyze page performance including load times and network resources. 析頁性能含載時網絡資源. Use when: check page speed, audit load times, analyze network waterfall, optimize performance, find slow resources"
allowed-tools: ["mcp__agnt__proxy", "mcp__agnt__proxylog"]
context: fork
agent: agnt:browser-debugger
---

<!-- CC 2.1 fork decision: workflow driver (perf trace, network waterfall, multiple proxy diagnostic calls). Fork keeps parent loop free of large trace dumps. Executor: agnt:browser-debugger. -->


藉agnt診斷工具分析當前瀏覽器頁面效能。

## 步驟

1. 捕獲網路效能資料：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.captureNetwork()"}
   ```

2. 查影響效能之佈局問題：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.findOverflows()"}
   ```

3. 分析DOM複雜度（影響渲染效能）：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.auditDOMComplexity()"}
   ```

4. 查堆疊上下文（可能引發重繪問題）：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.findStackingContexts()"}
   ```

5. 從代理日誌查效能指標：
   ```
   proxylog {proxy_id: "dev", types: ["performance"], limit: 10}
   ```

## 解讀結果

### 網路分析（`captureNetwork`）
- `resources`：所有已載入資源陣列
- `count`：資源總數
- 每個資源含：
  - `name`：資源URL
  - `type`：initiator類型（script、img、css等）
  - `duration`：載入時間（毫秒）
  - `size`：傳輸大小（位元組）
  - `startTime`：開始載入時間

### DOM複雜度（`auditDOMComplexity`）
- `totalElements`：DOM節點總數（目標<1500）
- `maxDepth`：最大嵌套深度（目標<32）
- `duplicateIds`：重複使用之ID（應為0）
- `scripts`：腳本數量（最小化）
- `stylesheets`：樣式表數量（最小化）

### 佈局問題（`findOverflows`）
- 有捲動溢出之元素（潛在佈局抖動）
- 隱藏溢出元素（可能引發重排）

### 堆疊上下文
- 建立新堆疊上下文之元素
- 原因：有z-index之定位、opacity < 1、transform、filter

## 效能最佳實踐

1. **減少DOM大小** — 元素越少，渲染越快
2. **最小化網路請求** — 打包與延遲載入
3. **避免佈局抖動** — 批量DOM讀寫
4. **優化圖片** — 使用適當格式與大小
5. **減少JavaScript** — 最小化、延遲或非同步載入
6. **使用高效CSS** — 避免深嵌套與複雜選擇器

## 來自代理日誌之效能指標

代理自動捕獲Navigation Timing API指標：
- `domContentLoaded`：至DOMContentLoaded時間
- `loadEventEnd`：至完整頁面載入時間
- `firstPaint`：至首次繪製時間
- `largestContentfulPaint`：至LCP時間（核心Web指標）

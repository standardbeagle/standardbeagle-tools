---
description: "Analyze user experience including layout, interactions, and usability. 析用戶體驗含布局交互可用性. Use when: review UX, analyze interactions, check usability, audit user flows, evaluate interface design"
allowed-tools: ["mcp__agnt__proxy", "mcp__agnt__proxylog"]
---

藉agnt診斷工具分析當前頁面之用戶體驗（UX）。

## 步驟

1. 查佈局問題與溢出：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.findOverflows()"}
   ```

2. 找視窗外元素（隱藏內容）：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.findOffscreen()"}
   ```

3. 取近期用戶互動以理解用戶流程：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.interactions.getHistory()"}
   ```

4. 查近期DOM變動（動態UI回饋）：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.mutations.getHistory()"}
   ```

5. 取鍵盤導航順序（tab順序）：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.getTabOrder()"}
   ```

6. 截圖記錄當前狀態：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.screenshot('ux-analysis')"}
   ```

## 可用UX診斷

### 佈局分析

| Function | Purpose |
|----------|---------|
| `findOverflows()` | 找可捲動或隱藏溢出內容 |
| `findOffscreen()` | 找視窗外元素 |
| `findStackingContexts()` | 找z-index層次問題 |
| `diagnoseLayout()` | 完整佈局報告 |

### 互動追蹤

| Function | Purpose |
|----------|---------|
| `interactions.getHistory()` | 所有追蹤之用戶互動 |
| `interactions.getLastClick()` | 最近點擊詳情 |
| `interactions.getLastClickContext()` | 最後點擊完整上下文 |
| `interactions.getClicksOn(selector)` | 特定元素上之點擊 |
| `interactions.getMouseTrail()` | 滑鼠移動路徑 |

### 變動追蹤

| Function | Purpose |
|----------|---------|
| `mutations.getHistory()` | 所有DOM變動 |
| `mutations.getAdded()` | 最近新增元素 |
| `mutations.getRemoved()` | 最近移除元素 |
| `mutations.getModified()` | 最近修改元素 |
| `mutations.highlightRecent(ms)` | 視覺高亮近期變更 |

## UX評估清單

### 視覺設計
- [ ] 一致間距與對齊
- [ ] 清晰視覺層次
- [ ] 足夠色彩對比度
- [ ] 可讀字體大小（正文最小16px）
- [ ] 觸控目標最小44x44px

### 導航
- [ ] 邏輯tab順序
- [ ] 焦點指示器可見
- [ ] 清晰導航結構
- [ ] 適當處有麵包屑
- [ ] 返回按鈕正常

### 回饋
- [ ] 顯示載入狀態
- [ ] 錯誤訊息有助益
- [ ] 提供成功確認
- [ ] 互動元素有懸浮狀態
- [ ] 表單驗證即時

### 內容
- [ ] 重要內容在折疊線上
- [ ] 標題易掃描
- [ ] 簡潔清晰文案
- [ ] CTA醒目
- [ ] 無內容裁剪

## 互動式除錯

```
// Highlight recent DOM changes
proxy {action: "exec", id: "dev", code: "__devtool.mutations.highlightRecent(5000)"}

// Get context of last user click
proxy {action: "exec", id: "dev", code: "__devtool.interactions.getLastClickContext()"}

// Check if specific element is visible
proxy {action: "exec", id: "dev", code: "__devtool.isVisible('#my-element')"}

// Check if element is in viewport
proxy {action: "exec", id: "dev", code: "__devtool.isInViewport('#my-element')"}
```

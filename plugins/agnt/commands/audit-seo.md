---
description: "Audit page for SEO best practices and issues. 審頁面搜尋優化得失. Use when: check SEO score, fix meta tags, audit page titles, review structured data, improve search ranking"
allowed-tools: ["mcp__agnt__proxy", "mcp__agnt__proxylog"]
context: fork
agent: agnt:browser-debugger
---

<!-- CC 2.1 fork decision: workflow driver (meta-tag scan, structured-data validation, title/heading review). Fork keeps parent free of SEO detail dumps. Executor: agnt:browser-debugger. -->


藉agnt診斷工具稽核當前頁面之SEO最佳實踐。

## 步驟

1. 執行頁面品質稽核（含SEO檢查）：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.auditPageQuality()"}
   ```

2. 分析DOM結構中SEO相關元素：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.auditDOMComplexity()"}
   ```

3. 查無障礙性（影響SEO）：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.auditAccessibility()"}
   ```

4. 截圖供視覺參考：
   ```
   proxy {action: "exec", id: "dev", code: "__devtool.screenshot('seo-audit')"}
   ```

## 稽核檢查內容

### 頁面品質問題

| Issue | Severity | Description |
|-------|----------|-------------|
| `missing-viewport` | warning | 無viewport meta標籤（行動SEO） |
| `missing-description` | info | 無meta描述（搜尋摘要） |
| `missing-h1` | warning | 無H1標題（內容層次） |
| `multiple-h1` | info | 多個H1標題（層次混亂） |
| `missing-lang` | warning | 無lang屬性（語言偵測） |
| `missing-title` | error | 無頁面標題（SEO關鍵） |

### 與SEO相關之DOM結構
- `links`：頁面連結數
- `images`：圖片數（應有alt文字）
- `forms`：表單數

## 手動SEO清單

自動稽核後，另行驗證：

### 標題與Meta
- [ ] 標題50-60字元
- [ ] Meta描述150-160字元
- [ ] 關鍵字自然出現於內容中

### 內容結構
- [ ] 含主要關鍵字之單一H1
- [ ] 邏輯標題層次（H1 > H2 > H3）
- [ ] 內容獨特且有價值

### 技術SEO
- [ ] 頁面載入3秒內
- [ ] 行動裝置友好設計
- [ ] 啟用HTTPS
- [ ] 設定canonical URL
- [ ] 存在結構化資料（JSON-LD）

### 圖片
- [ ] 所有圖片有描述性alt文字
- [ ] 圖片尺寸已優化
- [ ] 圖片有描述性檔名

### 連結
- [ ] 內部連結使用描述性錨點文字
- [ ] 外部連結在新分頁開啟含rel="noopener"
- [ ] 無斷連（404）

## 附加診斷命令

```
// Check all images for alt text
proxy {action: "exec", id: "dev", code: "Array.from(document.images).map(i => ({src: i.src, alt: i.alt}))"}

// Get all headings in order
proxy {action: "exec", id: "dev", code: "Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map(h => ({tag: h.tagName, text: h.textContent.trim()}))"}

// Check for meta tags
proxy {action: "exec", id: "dev", code: "Array.from(document.querySelectorAll('meta')).map(m => ({name: m.name || m.property, content: m.content}))"}
```

---
name: ux-developer-ux-review
description: "\"Comprehensive UX review of page, component, or flow using heuristics and best practices. 綜合UX審查：Nielsen啟發評分、無障礙快查、移動端、性能影響、優先行動項。 Use when: reviewing page or component, design critique, investigating reported usability issues.\""
disable-model-invocation: true
---

# UX Review Command

對指定目標（頁面、組件或流程）進行全面UX審查。

## Process

### 1. Gather Context

首先了解審查對象：
- 詢問用戶要審查什麼（頁面URL、組件或代碼）
- 若提供URL，使用agnt代理捕獲並分析頁面
- 若提供代碼，直接分析實現

### 2. Start Development Proxy (if reviewing live page)

```
1. proxy {action: "start", id: "ux-review", target_url: "<URL>"}
2. automation {action: "start", proxy_id: "ux-review"} then automation {action: "screenshot", session_id: "<id>", type: "fullpage"}
3. currentpage {proxy_id: "ux-review", action: "summary"}
```

### 3. Apply Nielsen's 10 Heuristics

對每條啟發評分1–5：

| Heuristic | Score | Issues | Recommendations |
|-----------|-------|--------|-----------------|
| Visibility of system status | | | |
| Match between system and real world | | | |
| User control and freedom | | | |
| Consistency and standards | | | |
| Error prevention | | | |
| Recognition rather than recall | | | |
| Flexibility and efficiency of use | | | |
| Aesthetic and minimalist design | | | |
| Help users recognize and recover from errors | | | |
| Help and documentation | | | |

### 4. Accessibility Quick Check

運行無障礙審計：
```
proxy {action: "exec", id: "ux-review", code: "__devtool.auditAccessibility()"}
```

標記關鍵問題：
- Missing alt text
- Insufficient color contrast
- Missing form labels
- Keyboard navigation issues
- Missing ARIA landmarks

### 5. Mobile/Responsive Check

評估：
- 觸控目標尺寸（最小44x44px）
- 窄視口下內容重排
- 字體無需縮放即可閱讀
- 無需水平滾動

### 6. Performance Impact on UX

通過agnt檢查：
```
1. get_errors {proxy_id: "ux-review"}
2. proxylog {proxy_id: "ux-review", action: "summary"}
3. currentpage {proxy_id: "ux-review", action: "summary"}
```

標記影響UX之問題：
- 首次內容繪製慢
- 佈局偏移（CLS）
- 長時間阻塞任務

### 7. Generate Report

提供結構化報告：

```markdown
## UX Review Summary

**Target**: [what was reviewed]
**Overall Score**: X/50

### Critical Issues (Must Fix)
1. [Issue]: [Impact] - [Recommendation]

### Major Issues (Should Fix)
1. [Issue]: [Impact] - [Recommendation]

### Minor Issues (Nice to Fix)
1. [Issue]: [Impact] - [Recommendation]

### Strengths
- [What's working well]

### Prioritized Action Items
1. [ ] [Highest priority fix]
2. [ ] [Second priority]
3. [ ] [Third priority]
```

## Integration with Development

審查後提供：
1. 為每項問題在項目追蹤器中創建任務
2. 生成含代碼示例的修復建議
3. 通過agnt代理設置持續監控

## Related

- `ux-design:ux-audit` — 姊妹 Nielsen 啟發評估：本審查由 agnt runtime 實測真實頁，彼針對設計稿/運行前 mockup。二者互補，勿合併（跨 plugin）。

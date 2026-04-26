---
name: ux-audit
description: "Conduct a comprehensive UX evaluation using Nielsen's heuristics and usability best practices. 運用Nielsen啟發式原則進行全面UX評估，識別並優先處理可用性問題。 Use when: evaluating an interface for usability, conducting a formal heuristic review, generating a prioritized issue report."
---

# UX Heuristic Audit

> Invoke the `Skill` tool with `skill: ux-design:ux-heuristics` — 啟發式評估框架為本命令基礎。

汝正使用Nielsen 10大啟發式原則與現代可用性原理，進行徹底的UX評估。

## Audit Setup

### 1. Define Scope
"What are we evaluating?
- Entire application
- Specific user flow(s)
- Single feature or page
- Comparison between versions"

### 2. Gather Materials
向用戶請求：
- 界面的截圖或訪問權限
- 要評估的關鍵用戶流程
- 用戶角色或目標受眾描述
- 已知的痛點（若有）
- 體驗的業務目標

### 3. Establish Context
"What context should I keep in mind?
- Target users (expertise level, demographics)
- Platform constraints (mobile, desktop, both)
- Domain-specific conventions
- Competitive context"

## Systematic Evaluation

逐一系統性評估每個啟發式原則：

### Evaluation Template Per Screen/Flow

```
SCREEN: [Name]
USER GOAL: [What user is trying to accomplish]

──────────────────────────────────────────────────────────────
1. VISIBILITY OF SYSTEM STATUS
──────────────────────────────────────────────────────────────
Observations:
[What status feedback exists?]

Issues Found:
[ ] #001 | Severity: X | [Issue description]
[ ] #002 | Severity: X | [Issue description]

Recommendations:
- [Specific improvement suggestion]
──────────────────────────────────────────────────────────────

2. MATCH BETWEEN SYSTEM AND REAL WORLD
──────────────────────────────────────────────────────────────
Observations:
[Does language/iconography match user expectations?]

Issues Found:
[ ] #003 | Severity: X | [Issue description]

Recommendations:
- [Specific improvement suggestion]
──────────────────────────────────────────────────────────────

[Continue for all 10 heuristics...]
```

### Severity Rating Scale

```
Severity 0: Not a usability problem
Severity 1: Cosmetic only - fix if time allows
Severity 2: Minor - low priority
Severity 3: Major - important to fix
Severity 4: Catastrophic - must fix before release
```

### Severity Assessment Criteria

```
           │ Low Frequency │ High Frequency │
───────────┼───────────────┼────────────────│
Low Impact │ 1 (Cosmetic)  │ 2 (Minor)      │
High Impact│ 3 (Major)     │ 4 (Critical)   │
```

## Issue Documentation

每個發現的問題記錄：

```
Issue #[XXX]
────────────────────────────────────────
Heuristic: [Which heuristic violated]
Severity:  [0-4]
Location:  [Screen/element where found]

Description:
[Clear description of the problem]

Impact:
[How this affects users]

Evidence:
[Screenshot reference or specific observation]

Recommendation:
[Concrete suggestion for improvement]

Priority: [Low / Medium / High / Critical]
Effort:   [Low / Medium / High]
────────────────────────────────────────
```

## Quick Checks to Perform

### Visual Scan
- [ ] 清晰的視覺層次（眯眼測試）
- [ ] 全程一致的樣式
- [ ] 文字/UI充足對比度
- [ ] 清晰的焦點指示器
- [ ] 適當的留白

### Interaction Check
- [ ] 所有操作有反饋
- [ ] 加載狀態存在
- [ ] 錯誤狀態已處理
- [ ] 破壞性操作可撤銷
- [ ] 鍵盤導航有效

### Content Check
- [ ] 清晰、無術語的語言
- [ ] 錯誤信息有幫助
- [ ] 標籤具描述性
- [ ] 需要時有說明
- [ ] 空狀態有指導

### Navigation Check
- [ ] 當前位置清晰
- [ ] 通往目標的路徑合理
- [ ] 返回/退出始終可用
- [ ] 無死胡同
- [ ] 搜索可用（若需要）

## Findings Summary

將發現整理為優先報告：

### Executive Summary

```
UX AUDIT SUMMARY
═══════════════════════════════════════════════════════

Scope:     [What was evaluated]
Date:      [Date of evaluation]
Evaluator: [Who conducted]

OVERALL ASSESSMENT: [Strong / Acceptable / Needs Work / Critical Issues]

────────────────────────────────────────────────────────
Issue Distribution:
────────────────────────────────────────────────────────
Severity 4 (Critical):    X issues
Severity 3 (Major):       X issues
Severity 2 (Minor):       X issues
Severity 1 (Cosmetic):    X issues
────────────────────────────────────────────────────────
Total Issues:             X

Most Violated Heuristics:
1. [Heuristic name] - X violations
2. [Heuristic name] - X violations
3. [Heuristic name] - X violations
═══════════════════════════════════════════════════════
```

### Prioritized Issue List

```
CRITICAL (Must Fix)
───────────────────
#XXX - [Brief description] (Severity 4)
#XXX - [Brief description] (Severity 4)

HIGH PRIORITY
───────────────────
#XXX - [Brief description] (Severity 3)
#XXX - [Brief description] (Severity 3)

MEDIUM PRIORITY
───────────────────
#XXX - [Brief description] (Severity 2)

LOW PRIORITY
───────────────────
#XXX - [Brief description] (Severity 1)
```

### Positive Observations

亦注意哪些有效：
```
STRENGTHS IDENTIFIED
───────────────────────────────────────
✓ [Positive observation 1]
✓ [Positive observation 2]
✓ [Positive observation 3]
```

## Recommendations

### Quick Wins
可輕鬆修復但高影響的問題：
- Issue #XXX: [Brief fix description]

### Strategic Improvements
規劃中的較大改進：
- [Improvement area]: [Description and rationale]

### Further Research Needed
需要用戶測試驗證的領域：
- [Area]: [What to test and why]

## Follow-Up Actions

建議後續步驟：
1. 立即處理關鍵問題
2. 將主要問題納入下一衝刺/周期計劃
3. 為次要問題創建積壓項目
4. 安排更改後的重新評估
5. 考慮用戶測試驗證

## Deliverables

提供：
1. **Executive Summary** - 高層次發現
2. **Issue Log** - 所有問題詳情
3. **Priority Matrix** - 按嚴重性/工作量排列的問題
4. **Recommendations** - 可操作的改進
5. **Checklist** - 修復的驗證項目

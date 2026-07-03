---
name: ux-developer-recommender
description: "Routes any UX / accessibility / frontend-UX intent to the one right manual ux-developer skill — the single auto-invoked gateway; all other ux-developer skills are manual. ux-developer 唯一自動網關，導向正確之手動技藝。 Use when: UX review or audit, accessibility / WCAG / a11y check, screen reader or keyboard nav, form or component UX, user flow, navigation, content hierarchy, cognitive load, loading or error states, mobile-first, touch targets, Nielsen heuristics, pre-deploy UX verify, agnt setup, unsure which ux skill."
---

# ux-developer Skill Recommender

此為 ux-developer 諸技藝之唯一**自動**網關。餘 19 技藝皆手動（`disable-model-invocation: true`）— 本技藝據意圖導向其一，避免每技藝描述皆耗 per-turn context。

> 職責：**判意圖 → 薦技藝 → 以 `Skill` 工具調之**。本技藝只路由，不執行 UX 工作。近義技藝眾（表單、組件、無障礙、審查各有二），故 Disambiguation 節尤要。

## Flow

1. 辨用戶意圖，對下表擇最近一行。
2. 告知：「宜用 `ux-developer:<skill>`」並以 `Skill` 工具調之（或提示 `/<skill>`）。
3. 意圖含混（如「表單」未分設計/審查，「無障礙」未分審計/參考）→ 先問範圍，再擇 Disambiguation 之對應行。
4. 意圖跨多行則列首選 + 次選，勿全羅列。

## Routing Table

| 意圖 / Intent | 技藝 / Skill |
|---|---|
| 初設 agnt MCP（本地二進制或 npx） | `ux-developer:setup-mcp` |
| 綜合 UX 審查（頁/組件/流程，含評分+優先項） | `ux-developer:ux-review`（見 Disambiguation） |
| 尼爾森十則逐則評分 | `ux-developer:nielsen-heuristics`（見 Disambiguation） |
| 部署前/提交前 UX 驗證清單 | `ux-developer:ux-verify` |
| WCAG 2.2 無障礙審計（axe + 手動 + 修復碼） | `ux-developer:a11y-check`（見 Disambiguation） |
| WCAG 2.2 指南參考（POUR/A/AA/AAA） | `ux-developer:wcag-guidelines`（見 Disambiguation） |
| 屏幕閱讀器無障礙（語義/ARIA/公告/焦點） | `ux-developer:screen-reader` |
| 鍵盤導航（焦點可見/順序/無陷阱/組件模式） | `ux-developer:keyboard-navigation` |
| 觸控目標尺寸與間距 | `ux-developer:touch-targets` |
| 設計或審查表單 UX（agnt 實時檢查） | `ux-developer:form-ux`（見 Disambiguation） |
| 表單設計最佳實踐（標籤/驗證/自動填充/多步） | `ux-developer:form-design`（見 Disambiguation） |
| 設計或審查 UI 組件（狀態/鍵盤/ARIA/響應） | `ux-developer:component-ux` |
| 設計或分析用戶流程（映射旅程/識別摩擦） | `ux-developer:user-flow` |
| 導航設計模式（欄/側邊/漢堡/麵包屑） | `ux-developer:navigation-patterns` |
| 視覺層次與內容結構（可掃描佈局/標題審計） | `ux-developer:content-hierarchy` |
| 認知負荷削減（漸進披露/精簡選擇/智能默認） | `ux-developer:cognitive-load` |
| 加載狀態（旋轉/進度/骨架屏 + ARIA） | `ux-developer:loading-states` |
| 錯誤狀態 UX（消息清晰/焦點/可復） | `ux-developer:error-handling` |
| 移動優先設計與斷點 | `ux-developer:mobile-first` |

## Disambiguation

近義技藝抉擇（此 bundle 之關鍵）：

- **表單**：設計/審查具體表單、要 agnt 實時檢查 → `ux-developer:form-ux`；查閱標籤/驗證/自動填充/多步之原則參考 → `ux-developer:form-design`。
- **無障礙**：對真實頁跑審計（axe + 手動 + 修復碼）→ `ux-developer:a11y-check`；查 WCAG 準則/POUR/等級之參考 → `ux-developer:wcag-guidelines`；針對屏幕閱讀器 → `ux-developer:screen-reader`；針對鍵盤操作 → `ux-developer:keyboard-navigation`。
- **審查**：全面 UX 審查（多維度 + 優先行動）→ `ux-developer:ux-review`；僅按尼爾森十則逐則評分 → `ux-developer:nielsen-heuristics`；提交/部署前把關清單 → `ux-developer:ux-verify`。
- **組件 vs 表單**：通用交互組件 → `ux-developer:component-ux`；表單專屬 → `ux-developer:form-ux` / `form-design`。

## Related

- `ux-developer:ux-review` — 最常用之綜合入口，含無障礙快查與啟發評分。
- `ux-auditor` 代理 — 全面 UX 審計（啟發 + WCAG + 移動 + 性能）之協調者。
- `a11y-specialist` 代理 — 深度無障礙（認證/VPAT/複雜組件）。
- `component-designer` 代理 — 組件由規格至實現之全流程。
- `flow-analyst` 代理 — 用戶旅程映射與 agnt 實時測試。

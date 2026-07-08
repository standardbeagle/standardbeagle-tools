---
name: ux-design-recommender
description: "Routes any UX / visual-design intent to the one right manual ux-design skill — the single auto-invoked gateway; all other ux-design skills are manual. ux-design 唯一自動網關，導向正確之手動技藝。 Use when: design color palette, typography, components or design system, design tokens, icons, responsive layout, visual hierarchy, accessibility review, UX audit or heuristic evaluation, unsure which ux-design skill."
---

# ux-design Skill Recommender

此為 ux-design 諸技藝之唯一**自動**網關。餘皆手動 — 本技藝據意圖導向其一，並化解重疊技藝之抉擇。

> 職責：**判意圖 → 薦技藝 → 以 `Skill` 工具調之**。此技藝不執行設計，只路由。

## Flow

1. 辨意圖，對下表擇最近一行。
2. 告知：「宜用 `ux-design:<skill>`」並調之（或提示 `/<skill>`）。
3. 意圖跨數行（如「色彩」未分理論/實作）→ 先問範圍，再依 Disambiguation 擇對應行。

## Routing Table

| 意圖 / Intent | 技藝 / Skill |
|---|---|
| 色彩學原理、色輪關係、心理影響（概念） | `ux-design:color-theory`（見 Disambiguation） |
| 互動式建調色板、色階、對比驗證（實作） | `ux-design:color-palette`（見 Disambiguation） |
| 字體系統概念：選字、比例、配對、可讀性 | `ux-design:typography`（見 Disambiguation） |
| 逐步建完整字體系統（含響應式輸出） | `ux-design:typography-system`（見 Disambiguation） |
| 元件設計原理：解剖、狀態、變體、規模化 | `ux-design:component-design`（見 Disambiguation） |
| 建元件庫結構：變體系統、狀態定義、文檔 | `ux-design:component-library`（見 Disambiguation） |
| 建 design token 系統、主題、CSS 變量、多平台輸出 | `ux-design:design-tokens` |
| 圖示選擇/設計、圖示系統、尺寸與無障礙 | `ux-design:iconography` |
| 響應式策略、斷點系統、自適應佈局、移動導航 | `ux-design:responsive-patterns` |
| 視覺層次：佈局構圖、視覺重量、注意力流 | `ux-design:visual-hierarchy` |
| 無障礙設計、WCAG 合規、焦點態、觸控目標 | `ux-design:accessibility` |
| Nielsen 啟發式 UX 審計、生成優先問題報告（正式） | `ux-design:ux-audit`（見 Disambiguation） |
| UX 啟發式框架、認知原理、可用性違規識別（框架） | `ux-design:ux-heuristics`（見 Disambiguation） |

## Disambiguation

近義技藝抉擇（此 bundle 之關鍵）：

- **色彩**：概念/原理（色輪、和諧、心理）→ `ux-design:color-theory`；動手建調色板、色階、對比驗證 → `ux-design:color-palette`。
- **字體**：原理與選字/配對/可讀性 → `ux-design:typography`；逐步產出完整字體系統（比例+響應式輸出）→ `ux-design:typography-system`。
- **元件**：設計原理與模式（解剖/狀態/變體）→ `ux-design:component-design`；落地元件庫結構+文檔 → `ux-design:component-library`。二者常接力：先 design 後 library。
- **UX 評估**：實跑一次正式審計並出優先報告 → `ux-design:ux-audit`；欲學/套用啟發式框架與認知原理 → `ux-design:ux-heuristics`。
- **無障礙**：設計視角之 WCAG/焦點/觸控 → `ux-design:accessibility`；亦為 color-palette、component-* 等技藝之橫切校驗。

## Related

- `ux-design:accessibility` — 貫穿色彩、元件、字體諸技藝之橫切校驗，宜隨行。
- `design-consultant` 代理 — 融合多設計學科之整體設計諮詢協調者。
- `ux-developer:*`（姊妹 plugin）— 設計交予實作對應：組件/無障礙/響應/Nielsen 審查之開發實現側。

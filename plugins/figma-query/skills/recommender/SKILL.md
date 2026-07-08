---
name: figma-query-recommender
description: "Routes any Figma / figma-query intent to the one right manual skill among 30+ — the single auto-invoked gateway; all other figma-query skills are manual. figma-query 唯一自動網關，導向正確之手動技藝。 Use when: mention Figma, extract components/pages/assets/tokens, query or search a Figma file, inspect nodes/styles/CSS, sync a file offline, diff versions, build docs, set up figma-query, unsure which figma skill."
---

# figma-query Skill Recommender

figma-query 逾 30 技藝之唯一**自動**網關。餘皆手動 — 本技藝據意圖導向其一，並化解重疊技藝之抉擇。

> 職責：**判意圖 → 薦技藝 → 以 `Skill` 工具調之**。近義技藝眾多，故 Disambiguation 節尤要。

## Flow

1. 辨意圖，對下表擇最近一行。
2. 告知：「宜用 `figma-query:<skill>`」並調之（或提示 `/<skill>`）。
3. 意圖含混（如「提取」未分組件/頁/庫）→ 先問範圍，再擇 Disambiguation 之對應行。

## Routing Table

| 意圖 / Intent | 技藝 / Skill |
|---|---|
| 初設 figma-query MCP + token | `figma-query:setup-figma` |
| 提取前飛行檢查 / 驗證環境 | `figma-query:preflight-check` |
| MCP 幫助 / 工具信息 / 狀態 | `figma-query:figma-info` |
| JSON DSL 查詢文件（過濾/投影/分頁） | `figma-query:figma-query` |
| 全文搜索（名稱/文本/屬性） | `figma-query:figma-search` |
| 按 ID 取單節點詳情 | `figma-query:figma-node` |
| 文件結構樹（ASCII/JSON + node IDs） | `figma-query:figma-tree` |
| 列所有組件（變體/用量/分類） | `figma-query:figma-components` |
| 列所有樣式（色/字/效果/網格） | `figma-query:figma-styles` |
| 取 design token 引用與解析值 | `figma-query:figma-tokens` |
| 從節點抽生產級 CSS | `figma-query:figma-css` |
| 生成可視 wireframe（含 ID 圖例） | `figma-query:figma-wireframe` |
| 同步文件至本地供離線 grep | `figma-query:figma-sync`（見 Disambiguation） |
| 導出 token 至 CSS/JSON/Tailwind | `figma-query:figma-export-tokens` |
| 導出指定節點之圖像/圖標（多格式/縮放） | `figma-query:figma-export-assets` |
| 按 imageRef 下載 / 渲染節點為圖 | `figma-query:figma-download` |
| 抽全部資源（含背景/填充/矢量） | `figma-query:extract-assets`（見 Disambiguation） |
| 提取單組件（CSS+資源+文檔+HTML） | `figma-query:component-extraction`（見 Disambiguation） |
| 交互式多選組件導出（Go 模板生 CSS/SCSS） | `figma-query:extract-components` |
| 提取整頁/整屏 | `figma-query:page-extraction`（見 Disambiguation） |
| 交互式多頁導出（頁 mockup CSS/SCSS） | `figma-query:extract-pages` |
| 提取完整設計庫（驗證+依賴檢查） | `figma-query:complete-extraction`（見 Disambiguation） |
| 提取完整設計庫（對抗協作驗證循環） | `figma-query:adversarial-design-library`（見 Disambiguation） |
| 比較文件版本 / 追蹤設計變更 | `figma-query:figma-diff` |
| 校驗提取結果之完整正確 | `figma-query:validate-extraction` |
| 建組件/頁文檔站點 | `figma-query:build-docs` |
| 常用工作流模式參考 | `figma-query:common-patterns` |

## Disambiguation

近義技藝抉擇（此 bundle 之關鍵）：

- **資源提取**：
  - 指定節點、要多格式/縮放 → `figma-query:figma-export-assets`
  - 掃全文件之一切資源（含隱藏背景/填充/矢量）→ `figma-query:extract-assets`
  - 僅按 imageRef/渲染單圖 → `figma-query:figma-download`
- **組件提取**：一次性單組件 → `figma-query:component-extraction`；交互式多選組件（Go 模板 SCSS/CSS）→ `figma-query:extract-components`。
- **頁提取**：完整頁+組件+文檔 → `figma-query:page-extraction`；交互式多頁 mockup SCSS/CSS → `figma-query:extract-pages`。
- **整庫提取**（依嚴謹度遞增）：
  - 含驗證+依賴檢查 → `figma-query:complete-extraction`
  - 對抗協作循環（最嚴，CSS+資源+文檔全驗）→ `figma-query:adversarial-design-library`
- **離線同步**：`figma-query:figma-sync` 導出本地結構供離線 grep 與快速緩存查詢。
- **token**：引用/解析值查詢 → `figma-query:figma-tokens`；導出至 CSS/JSON/Tailwind → `figma-query:figma-export-tokens`。

## Related

- `figma-query:preflight-check` — 任何提取前之環境校驗，宜先行。
- `figma-query:common-patterns` — 端到端工作流之組合範式。
- `library-extractor` 代理 — 帶對抗驗證之整庫提取協調者。

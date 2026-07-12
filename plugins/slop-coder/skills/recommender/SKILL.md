---
name: slop-coder-recommender
description: "Routes SLOP-language / slop-coder intent to right manual skill — sole auto gateway, others manual. slop-coder 唯一自動網關。 Use when: write or scaffold SLOP code, explain unfamiliar SLOP code, look up builtin function signature, look up SLOP syntax/operators/control-flow, SLOP module system, SLOP agent/pipeline patterns, unsure which slop-coder skill."
---

# slop-coder Skill Recommender

此為 slop-coder 諸技藝之唯一**自動**網關。餘 5 技藝皆手動（`disable-model-invocation: true`）— 本技藝據意圖導向其一，避免每技藝描述皆耗 per-turn context。

> 職責：**判意圖 → 薦技藝 → 以 `Skill` 工具調之**。本技藝不寫代碼，只路由。

## Flow

1. 辨用戶意圖，對下表擇最近一行。
2. 告知：「宜用 `slop-coder:<skill>`」並以 `Skill` 工具調之（或提示 `/<skill>`）。
3. 意圖跨多行則列首選 + 次選，勿全羅列。
4. 「寫 vs 解 vs 查」近義 → 見 Disambiguation。

## Routing Table

| 意圖 / Intent | 技藝 / Skill |
|---|---|
| 由需求生成 SLOP 程式 / scaffold agent/pipeline | `slop-coder:slop-write` |
| 解析既有 SLOP 代碼之邏輯與行為 | `slop-coder:slop-explain` |
| 查內置函數簽名（type/math/string/collection/pipeline） | `slop-coder:builtins` |
| 查語法 / 運算符 / 控制流 / loop 修飾 / emit | `slop-coder:language-reference` |
| 模組系統：創建、依賴、remap、mock 測試 | `slop-coder:modules` |
| 慣用範式：agent/pipeline boilerplate、批次、重試、分類 | `slop-coder:patterns` |

## Disambiguation

- **write vs patterns**：欲產完整可運行程式 → `slop-write`；欲僅取某慣用片段/idiom 參照 → `patterns`。
- **builtins vs language-reference**：查**函數**簽名 → `builtins`；查**語言**語法/運算符/關鍵字 → `language-reference`。
- **explain vs language-reference**：解某具體代碼在做什麼 → `slop-explain`；查通用語法定義 → `language-reference`。

## Related

- `slop-coder:language-reference` — 寫或解 SLOP 前之語法底座。
- `slop-coder:builtins` — 寫 pipeline/collection 邏輯時之函數速查。
- 欲**執行** SLOP / 撰 `custom_tool` body / 跨 MCP 運行腳本 → `slop-mcp:scripting`（`run_slop`、MCP 集成、記憶原語）。slop-coder 司語言，scripting 司執行。

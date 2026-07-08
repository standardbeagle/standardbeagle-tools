---
name: compound-review-recommender
description: "Routes any compound-review / code-review / debug / product intent to the one right manual skill — the single auto-invoked gateway; all other compound-review skills are manual. compound-review 唯一自動網關，導向正確之手動技藝。 Use when: simplify recently changed code, debug an error or test failure, dispatch an adversarial reviewer (correctness/testing/maintainability/typescript-strict/cli-readiness) over a diff, run a product pulse report, write or update STRATEGY.md, unsure which compound-review skill."
---

# compound-review Skill Recommender

此為 compound-review 諸技藝之唯一**自動**網關。餘 8 技藝皆手動（`disable-model-invocation: true`）— 本技藝據意圖導向其一，避免每技藝描述皆耗 per-turn context。

> 職責：**判意圖 → 薦技藝 → 以 `Skill` 工具調之**。本技藝不執行審查，只路由。

## Flow

1. 辨用戶意圖，對下表擇最近一行。
2. 告知：「宜用 `compound-review:<skill>`」並以 `Skill` 工具調之（或提示 `/<skill>`）。
3. 意圖跨多行則列首選 + 次選，勿全羅列。
4. 五審查者技藝（correctness/testing/maintainability/typescript-strict/cli-readiness）為 fork-context 子代理，宜由 `simplify-code` 或審查編排派發，非逐一手調 → 見 Disambiguation。（`rationalization-trap-reviewer` 僅存於 `agents/`，為 worktrack review-panel 專用，非本網關可派，故不列於下表。）

## Routing Table

| 意圖 / Intent | 技藝 / Skill |
|---|---|
| 簡化近改代碼（reuse/quality/efficiency 三審 + 修 + 驗） | `compound-review:simplify-code` |
| 找根因、修 bug、查測試失敗、追堆棧 | `compound-review:debug` |
| 對 diff 派對抗**正確性**審查子代理 | `compound-review:correctness-reviewer` |
| 對 diff 派對抗**測試品質**審查子代理 | `compound-review:testing-reviewer` |
| 對 diff 派對抗**可維護性**審查子代理 | `compound-review:maintainability-reviewer` |
| 對 TS diff 派**型別安全**審查子代理 | `compound-review:typescript-strict-reviewer` |
| 對 CLI diff 派**agent-就緒**審查子代理 | `compound-review:cli-readiness-reviewer` |
| 時窗產品脈動報告（usage/quality/errors） | `compound-review:product-pulse` |
| 建/維 STRATEGY.md（問題/取徑/用戶/指標） | `compound-review:strategy` |

## Disambiguation

- **simplify-code vs 單一 reviewer**：欲對近改整體跑三向審查並自動修驗 → `simplify-code`；欲僅就某一維度派對抗審查子代理（verdict-only，不污主線）→ 對應 `*-reviewer`。
- **debug vs reviewer**：現有 bug/失敗須找根因並修 → `debug`；預防性 gate 某 diff 之品質 → 對應 `*-reviewer`。
- **strategy vs product-pulse**：定義/更新產品方向文檔 → `strategy`；量測近期實績與信號 → `product-pulse`。

## Related

- `compound-review:simplify-code` — PR 前之近改清理，內部即派多審查者。
- `compound-review:strategy` — ce-ideate/brainstorm/plan 之上游根基，宜先立。

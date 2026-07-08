---
name: risk-pipeline-recommender
description: "Routes any risk-pipeline / @risk-tagging / risk-review intent to the one right manual skill — the single auto-invoked gateway; all other risk-pipeline skills are manual. risk-pipeline 唯一自動網關，導向正確之手動技藝。 Use when: classify a task's risk vector + verdict + pipeline tier, backfill or re-tag @risk across a codebase, tag one code unit, aggregate unit risk into a task vector, dispatch reviewer roster from a risk vector, audit risk telemetry / calibration drift, unsure which risk-pipeline skill. Skip: internal pipeline callees fire from their caller, not user intent."
---

# risk-pipeline Skill Recommender

此為 risk-pipeline 諸技藝之唯一**自動**網關。餘 8 技藝皆手動（`disable-model-invocation: true`）— 本技藝據意圖導向其一，避免每技藝描述皆耗 per-turn context。

> 職責：**判意圖 → 薦技藝 → 以 `Skill` 工具調之**。本技藝不執行分類/標記，只路由。
> **注**：`risk-budget`、`risk-pipeline-dispatch`、`risk-tag-unit`、`risk-tag-sweep` 多由管道上游調用，非用戶直呼；用戶入口通常為 `risk-classify`、`tag-sweep`、`audit`。

## Flow

1. 辨用戶意圖，對下表擇最近一行。
2. 告知：「宜用 `risk-pipeline:<skill>`」並以 `Skill` 工具調之（或提示 `/<skill>`）。
3. 意圖跨多行則列首選 + 次選，勿全羅列。
4. wrapper vs 內部技藝近義 → 見 Disambiguation。

## Routing Table

| 意圖 / Intent | 技藝 / Skill |
|---|---|
| 分類某任務 → 風險向量 + 裁決 + 管道層 | `risk-pipeline:risk-classify` |
| 全庫回填 / 重標 @risk 標籤（用戶入口） | `risk-pipeline:tag-sweep`（見 Disambiguation） |
| 審計風險遙測、校準漂移報告（用戶入口） | `risk-pipeline:audit`（見 Disambiguation） |
| 標記單一代碼單元之 @risk 向量 | `risk-pipeline:risk-tag-unit` |
| 聚合單元風險 → 任務級向量 + split SOP | `risk-pipeline:risk-budget` |
| 由風險向量派審者陣列 + 模型 + tdd | `risk-pipeline:risk-pipeline-dispatch` |
| 批次並行掃全庫標記（內部引擎，resumable） | `risk-pipeline:risk-tag-sweep`（見 Disambiguation） |
| 重放 telemetry.jsonl 產校準審計（內部引擎） | `risk-pipeline:risk-telemetry-audit`（見 Disambiguation） |

## Disambiguation

- **tag-sweep vs risk-tag-sweep**：用戶命令入口（收 flags）→ `tag-sweep`；其所調之並行掃描引擎技藝 → `risk-tag-sweep`。
- **audit vs risk-telemetry-audit**：用戶命令入口 → `audit`；其底層遙測重放/報告引擎 → `risk-telemetry-audit`。
- **classify vs budget vs dispatch**：由任務起全流程 → `risk-classify`（內部再調 budget + dispatch）；僅聚合已標單元 → `risk-budget`；僅由向量派審者 → `risk-pipeline-dispatch`。

## Related

- `risk-pipeline:risk-classify` — 開發任務之風險入口，內部串接 budget + dispatch。
- `risk-pipeline:tag-sweep` — 啟用管道前之全庫 @risk 回填。

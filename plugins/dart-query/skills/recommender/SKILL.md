---
name: dart-query-recommender
description: "Routes any Dart / dart-query task-management intent to the one right manual skill — the single auto-invoked gateway; all other dart-query skills are manual. dart-query 唯一自動網關，導向正確之手動技藝。 Use when: mention Dart tasks or dart-query, create/query/update/delete tasks, batch or DartQL ops, task lifecycle or relationships, watch tasks, recurring tasks, PM recipes, workspace docs/time, set up dart-query, unsure which dart skill."
---

# dart-query Skill Recommender

此為 dart-query 諸技藝之唯一**自動**網關。餘 10 技藝皆手動 — 本技藝據意圖導向其一，免每技藝描述皆耗 per-turn context。

> 職責：**判意圖 → 薦技藝 → 以 `Skill` 工具調之**。本技藝不執行 Dart 調用，只路由。近義技藝有重疊，故 Disambiguation 節尤要。

## Flow

1. 辨用戶意圖，對下表擇最近一行。
2. 告知：「宜用 `dart-query:<skill>`」並以 `Skill` 工具調之（或提示 `/<skill>`）。
3. 意圖含混（如「查任務」未分結構過濾/全文搜/批量）→ 先問範圍，再據 Disambiguation 擇行。
4. 意圖跨多行則列首選 + 次選，勿全羅列。

## Routing Table

| 意圖 / Intent | 技藝 / Skill |
|---|---|
| 初設 dart-query MCP + DART_TOKEN | `dart-query:setup-dart-query` |
| 探索能力 / 載工作區配置 / 查 dartboard/folder | `dart-query:discovery` |
| 單任務創讀更刪 / 注釋 / 關係 / 增量更新 | `dart-query:task-crud` |
| 過濾/全文搜/分頁/詳細級別查任務 | `dart-query:querying`（見 Disambiguation） |
| 批量更刪 / DartQL / CSV 導入 | `dart-query:batch-ops`（見 Disambiguation） |
| 全程任務生命周期（分配→追蹤→完成→記時） | `dart-query:task-lifecycle`（見 Disambiguation） |
| workspace 工具：文檔/時間/附件/移位 | `dart-query:workspace`（見 Disambiguation） |
| 監察新/變/阻塞任務，輪詢+自動承接 | `dart-query:task-watching` |
| 重複任務：模板/CSV/克隆/排程/日期輪轉 | `dart-query:recurring-tasks`（見 Disambiguation） |
| PM 配方：迭代交接/分類/重平衡/清陳舊/報告 | `dart-query:project-recipes`（見 Disambiguation） |

## Disambiguation

- **querying vs batch-ops**：只讀查詢（過濾/搜索/分頁）→ `querying`；欲批量寫（更/刪/導入）或跑 DartQL 語句 → `batch-ops`。二者皆可用 `execute_dartql`，讀用 querying，寫用 batch-ops。
- **task-crud vs task-lifecycle**：單次原子操作（create/get/update/delete/comment）→ `task-crud`；欲端到端指引（創建→分配→追蹤→阻塞→完成→記時）→ `task-lifecycle`。
- **task-crud/workspace 之注釋與記時重疊**：核心任務欄位、關係、注釋 → `task-crud`；文檔、附件、時間追蹤、任務移位/定位 → `workspace`。
- **recurring-tasks vs task-watching**：定時**生成**任務 → `recurring-tasks`；**監察**既有任務狀態變化並響應 → `task-watching`。
- **recurring-tasks vs project-recipes**：純重複創建模式 → `recurring-tasks`；多步 PM 工作流（sprint 交接、triage、重平衡、報告）→ `project-recipes`。

## Related

- `dart-query:discovery` — 任何操作前之能力與工作區配置載入，宜先行。
- `dart-query:setup-dart-query` — 首次連接 Dart 之安裝與令牌配置。
- `slop-mcp` plugin — 經 SLOP `execute_tool` 暴露同一批 Dart 工具（`slop-mcp:dart-tools` 參數參考、`slop-mcp:dart-task-workflow` 逐步流）。若已走 slop-mcp 執行路徑，任務語義仍以本 dart-query 諸技藝為準。

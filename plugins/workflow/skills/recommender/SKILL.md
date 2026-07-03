---
name: workflow-recommender
description: "Routes any workflow / adversarial-loop intent to the one right manual workflow skill — the single auto-invoked gateway; all other workflow skills are manual. workflow 唯一自動網關，導向正確之手動技藝。 Use when: mention workflow loop, Ralph Wiggum loop, adversarial cooperation, start/stop/status a loop, add or queue a task, run quality gates, dispatch a reviewer, save or review loop memories, commit message, resolve review feedback, unsure which workflow skill."
---

# workflow Skill Recommender

此為 workflow 諸技藝之唯一**自動**網關。餘皆手動 — 本技藝據意圖導向其一，避免每技藝描述皆耗 per-turn context。

> 職責：**判意圖 → 薦技藝 → 以 `Skill` 工具調之**。本技藝不執行循環，只路由。

## Flow

1. 辨用戶意圖，對下表擇最近一行。
2. 告知：「此屬 X，宜用 `workflow:<skill>`」並以 `Skill` 工具調之（或提示 `/<skill>`）。
3. 意圖跨多行則列首選 + 次選，勿全羅列。
4. 意圖含混（如「跑任務」未分單任務/整循環）→ 先問範圍，再擇 Disambiguation 之對應行。

## Routing Table

| 意圖 / Intent | 技藝 / Skill |
|---|---|
| 啟動 Ralph Wiggum 對抗循環，順序執行任務表 | `workflow:start-loop` |
| 優雅停止當前循環，存檢查點 | `workflow:stop-loop` |
| 查循環狀態 / 進度 / 指標 / 衛生報告 | `workflow:loop-status` |
| 添加上下文適配任務至隊列（grill-task 審訊） | `workflow:add-task` |
| 執行單一任務端到端（含對抗驗證） | `workflow:adversarial-quality`（見 Disambiguation） |
| 主循環協調：隊列、子代理生命週期、狀態機、錯誤恢復 | `workflow:loop-orchestration` |
| 隔絕上下文 / 子代理屏障 / 防污染 | `workflow:context-hygiene` |
| 派發代碼品質審查子代理（連貫/臃腫/完整/重複/清理） | `workflow:code-quality-reviewer` |
| 派發 QA 審查子代理（斷言/邊緣/TDD/可溯/可測） | `workflow:qa-reviewer` |
| 派發深度後任務審查子代理（OWASP/性能/架構/文檔/重規劃） | `workflow:post-task-reviewer` |
| 選測試層級 / 寫 e2e / 整合 / 單元測試 | `workflow:testing-strategy` |
| 壓縮前保存工作流知識為結構化記憶 | `workflow:memory-management` |
| 搜索 / 審查 / 管理已存工作流記憶 | `workflow:review-memories` |
| 配置項目特定工作流角色規則 | `workflow:setup-workflow` |
| 撰寫價值優先之 commit 訊息（或 --pr 之 PR 描述） | `workflow:commit-description` |
| 解決審查回饋（本地審查優先，PR 次之） | `workflow:resolve-review-feedback` |

## Disambiguation

- **單任務 vs 整循環**：跑整個任務表、隔離子代理順序執行 → `workflow:start-loop`；只跑一個任務之完整品質管道（實現+自攻+驗證+關卡） → `workflow:adversarial-quality`。
- **loop-orchestration vs start-loop**：實際啟動循環 → `workflow:start-loop`；循環內部機制（隊列、狀態機、錯誤恢復）之參考 → `workflow:loop-orchestration`。
- **記憶二技**：壓縮前保存新知 → `workflow:memory-management`；搜索/審查/管理既存記憶 → `workflow:review-memories`。
- **三審查子代理**：快速代碼品質門 → `workflow:code-quality-reviewer`；測試品質門 → `workflow:qa-reviewer`；快速門後之深度安全/架構/重規劃 → `workflow:post-task-reviewer`。
- **commit vs resolve-review-feedback**：寫 commit/PR 訊息 → `workflow:commit-description`；依審查回饋改代碼 → `workflow:resolve-review-feedback`。

## Related

- `workflow:start-loop` — 對抗循環之主入口。
- `workflow:context-hygiene` — 循環清潔之上下文屏障守則。
- `workflow:task-executor` 代理 — 清潔上下文單任務執行協調者。

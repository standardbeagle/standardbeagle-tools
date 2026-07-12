---
name: dartai-recommender
description: "Routes any dartai / Dart-backed Ralph-Wiggum-loop intent to the one right manual skill. The single auto-invoked gateway — every other dartai skill is manual. Use when: any dartai task, Dart task management, planning or executing a loop, and you need to know which dartai skill applies."
---

# dartai Skill Recommender

此為 dartai 諸技藝之唯一**自動**網關。餘 28 技藝皆手動（`disable-model-invocation: true`）— 本技藝據意圖導向其一，避免每技藝描述皆耗 per-turn context。

> 職責：**判意圖 → 薦技藝 → 以 `Skill` 工具調之**。本技藝不執行循環、不調 Dart，只路由。

## Flow

1. 辨用戶意圖，對下表擇最近一行。
2. 告知：「宜用 `dartai:<skill>`」並以 `Skill` 工具調之（或提示 `/<skill>`）。
3. 意圖跨多行則列首選 + 次選，勿全羅列。
4. 意圖含混（如「跑任務」「設置」「查任務」有近義多者）→ 見 Disambiguation。

## Routing Table

| 意圖 / Intent | 技藝 / Skill |
|---|---|
| 在看板啟動 Ralph Wiggum 對抗合作循環 | `dartai:start`（見 Disambiguation） |
| 執行單一任務端到端（含品質管道） | `dartai:task`（見 Disambiguation） |
| 任務執行工作流與品質管道之參考 | `dartai:task-execution`（見 Disambiguation） |
| 對抗品質循環：實施者/驗證者互制，逐階調計劃 | `dartai:adversarial-quality-loop` |
| 對抗規劃循環：驗計劃完整性、防過度設計 | `dartai:adversarial-planning-loop`（見 Disambiguation） |
| 創建最小聚焦任務計劃 | `dartai:simple-planning`（見 Disambiguation） |
| 查循環狀態 / 任務進度 / 當前任務 | `dartai:loop-status` |
| 派發代碼品質審查子代理（fork 上下文） | `dartai:code-quality-reviewer`（見 Disambiguation） |
| 派發 QA 審查子代理（fork 上下文） | `dartai:qa-reviewer` |
| 派發深度後任務審查子代理（OWASP/架構/文檔/重規劃） | `dartai:post-task-reviewer` |
| 將 refactor 提案路由入 Dart 任務（Phase 4.5） | `dartai:code-quality`（見 Disambiguation） |
| 對目標目錄/文件運行對抗性驗證 | `dartai:verify` |
| 審查者返回綱要（≤30 行 verdict 塊） | `dartai:verdict-schema` |
| 選測試層級 / 寫 e2e / 集成 / 單元測試 | `dartai:testing-strategy` |
| 生成 HTML 項目狀態報告（任務 + 會話日誌） | `dartai:report`（見 Disambiguation） |
| 對抗審查歷史任務找低效與缺口 | `dartai:review`（見 Disambiguation） |
| 同步本地工作與 Dart 狀態/評論 | `dartai:sync` |
| 首次設置 dart-query MCP 服務器 + Dart 令牌 | `dartai:setup-dart`（見 Disambiguation） |
| 配置項目特定 DartAI 角色規則 | `dartai:setup-roles`（見 Disambiguation） |
| 配置當前項目 dartai 設置（看板/runner/管道） | `dartai:dartai-config`（見 Disambiguation） |
| 診斷驗證插件掛鉤 | `dartai:hook-doctor` |
| dart-query 全工具參考（24 工具、參數、類型） | `dartai:dart-query-reference`（見 Disambiguation） |
| 過濾/搜索任務、分頁、詳情層級 | `dartai:task-filtering`（見 Disambiguation） |
| 任務關係：子任務、阻塞、重複、相關 | `dartai:task-relationships`（見 Disambiguation） |
| 批量更新/刪除、DartQL、CSV 匯入 | `dartai:batch-operations`（見 Disambiguation） |
| 工作區：文檔、配置、看板、評論、時間、附件、移動 | `dartai:workspace-docs`（見 Disambiguation） |
| 更新 changelog / 寫 Dart 評論 / 文檔模板 | `dartai:doc-templates` |
| 搜索/綜合先前代理會話歷史 | `dartai:sessions` |

## Disambiguation

- **循環 vs 單任務 vs 參考**：啟動整看板順序執行 → `dartai:start`；只跑一任務之完整品質管道 → `dartai:task`；管道機制之參考文檔（非執行）→ `dartai:task-execution`。
- **三規劃技**：最小聚焦計劃、無研究 → `dartai:simple-planning`；含研究任務、防過度設計之驗證循環 → `dartai:adversarial-planning-loop`；實現階段之實施/驗證互制循環 → `dartai:adversarial-quality-loop`。
- **三審查子代理**：快速代碼品質門 → `dartai:code-quality-reviewer`；測試品質門 → `dartai:qa-reviewer`；快速門後之深度安全/架構/重規劃 → `dartai:post-task-reviewer`。
- **reviewer vs code-quality vs verify**：派發審查子代理（fork）→ `dartai:*-reviewer`；將提案持久化為 Dart 任務 → `dartai:code-quality`；對目錄運行一組驗證 → `dartai:verify`。
- **三設置技**：首次裝 dart-query MCP + 令牌 → `dartai:setup-dart`；配看板/runner/管道設置 → `dartai:dartai-config`；配角色規則/品質閾值 → `dartai:setup-roles`。
- **report vs review**：生成當前狀態 HTML 儀表板 → `dartai:report`；對抗審查歷史找低效/缺口/可改進 → `dartai:review`。
- **dart-query 五參考技**：全工具總覽 → `dartai:dart-query-reference`；查詢/過濾/分頁 → `dartai:task-filtering`；子任務/依賴關係 → `dartai:task-relationships`；批量寫/CSV → `dartai:batch-operations`；工作區文檔/評論/時間/附件 → `dartai:workspace-docs`。

## Related

- `dartai:start` — Dart-backed 對抗循環之主入口。
- `dartai:setup-dart` — 任何循環前之環境安裝，宜先行。
- `dartai:task-executor` 代理 — 清潔上下文單任務執行協調者。
- 檔案後端孿生見 `workflow` plugin（`workflow:recommender`）。

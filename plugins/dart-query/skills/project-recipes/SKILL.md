---
name: dart-query-project-recipes
description: "Project management recipes - sprint transitions, triage, team rebalancing, stale task cleanup, reporting, and priority recalibration with dart-query. 迭代交接、分類、團隊重平衡、陳舊清理、報告、優先級重校諸配方. Use when: end of sprint transition, triage backlog, rebalance team workload, cleanup stale tasks, generate sprint report, recalibrate priorities"
disable-model-invocation: true
---

# dart-query Project Recipes

常見項目管理工作流之即用配方。每份配方附觸發時機與逐步工具調用。批量操作語法詳見：

> Invoke the `Skill` tool with `skill: dart-query:batch-ops` — DartQL語法及安全協議。

## Access Pattern

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "<tool-name>"
  parameters: { ... }
```

---

## Recipe: Sprint Transition

**When:** 迭代末——未完成任務前移，已完成任務歸檔。

**Step 1 — 預覽待結轉任務（先乾跑）：**
```yaml
tool_name: execute_dartql
parameters:
  query: "UPDATE WHERE dartboard = 'Sprint 12' AND status != 'Done' SET dartboard = 'Sprint 13'"
  dry_run: true
```

**Step 2 — 確認預覽後執行移動：**
```yaml
tool_name: execute_dartql
parameters:
  query: "UPDATE WHERE dartboard = 'Sprint 12' AND status != 'Done' SET dartboard = 'Sprint 13'"
  dry_run: false
```

**Step 3 — 歸檔已完成任務：**
```yaml
tool_name: execute_dartql
parameters:
  query: "UPDATE WHERE dartboard = 'Sprint 12' AND status = 'Done' SET dartboard = 'Archive' COMMENT 'Sprint 12 complete'"
  dry_run: false
```

**Step 4 — 為新迭代任務設日期：**
```yaml
tool_name: execute_dartql
parameters:
  query: "UPDATE WHERE dartboard = 'Sprint 13' AND start_at IS NULL SET start_at = '2026-04-14', due_at = '2026-04-28'"
  dry_run: true   # preview first
```

**Step 5 — 生成迭代報告**（見下方Sprint Report配方）。

---

## Recipe: Triage

**When:** Backlog積壓失控——識別並升級緊急工作。

**Step 1 — 查找逾期任務：**
```yaml
tool_name: execute_dartql
parameters:
  query: "UPDATE WHERE due_at < '2026-04-10' AND status != 'Done' SET priority = 5"
  dry_run: true   # returns matched tasks without modifying
```

**Step 2 — 查找未分配高優先級任務：**
```yaml
tool_name: execute_dartql
parameters:
  query: "UPDATE WHERE priority >= 4 AND assignee IS NULL SET priority = 4"
  dry_run: true
```

**Step 3 — 查找被阻塞任務（有非空blocker_ids）：**
```yaml
tool_name: list_tasks
parameters:
  detail_level: full   # then filter client-side for non-empty blocker_ids
```

**Step 4 — 自動升級逾期任務：**
```yaml
tool_name: execute_dartql
parameters:
  query: "UPDATE WHERE due_at < '2026-04-10' AND status != 'Done' SET priority = 5 COMMENT 'Auto-escalated: overdue'"
  dry_run: true   # review before executing
```

---

## Recipe: Team Rebalancing

**When:** 成員超負荷、人員離職，或需要容量規劃。

**Step 1 — 查看每人進行中工作量：**
```yaml
tool_name: list_tasks
parameters:
  assignee: "person@company.com"
  status: "In Progress"
  detail_level: minimal
```
對每位成員重複，比較計數。

**Step 2 — 預覽待重分配任務（乾跑）：**
```yaml
tool_name: execute_dartql
parameters:
  query: "UPDATE WHERE assignee = 'overloaded@company.com' AND status = 'Todo' AND priority < 4 SET assignee = 'available@company.com' COMMENT 'Rebalanced from overloaded@company.com'"
  dry_run: true
```

**Step 3 — 審閱後執行重分配：**
```yaml
tool_name: execute_dartql
parameters:
  query: "UPDATE WHERE assignee = 'overloaded@company.com' AND status = 'Todo' AND priority < 4 SET assignee = 'available@company.com' COMMENT 'Rebalanced from overloaded@company.com'"
  dry_run: false
```

---

## Recipe: Stale Task Cleanup

**When:** 季度Backlog整理——發掘數月未動之任務。

**Step 1 — 查找陳舊任務（乾跑預覽）：**
```yaml
tool_name: execute_dartql
parameters:
  query: "WHERE updated_at < '2025-10-01' AND status != 'Done' AND status != 'Archived'"
  dry_run: true
```

**Step 2 — 標記待審閱：**
```yaml
tool_name: execute_dartql
parameters:
  query: "UPDATE WHERE updated_at < '2025-10-01' AND status != 'Done' AND status != 'Archived' SET tags = ['stale'] COMMENT 'Flagged as stale for grooming'"
  dry_run: false
```

**Step 3 — 團隊審閱後歸檔確認之陳舊任務：**
```yaml
tool_name: execute_dartql
parameters:
  query: "UPDATE WHERE tags CONTAINS 'stale' SET status = 'Archived'"
  dry_run: true   # preview first
```

**Step 4 — Delete very old archived tasks (irreversible — use confirm):**
```yaml
tool_name: execute_dartql
parameters:
  query: "DELETE WHERE status = 'Archived' AND completed_at < '2025-10-01' CONFIRM"
  dry_run: true   # always dry_run before DELETE
```

---

## Recipe: Sprint Report

**When:** 迭代評審、期末干係人更新。

**Step 1 — 按狀態統計任務數：**
```yaml
tool_name: list_tasks
parameters:
  dartboard: "Sprint 12"
  status: "Done"
  detail_level: minimal
```
對「In Progress」和「Todo」重複，得三項計數。

**Step 2 — 取看板總數：**
```yaml
tool_name: get_dartboard
parameters:
  dartboard_id: "Sprint 12"
```

**Step 3 — 創建報告文檔：**
```yaml
tool_name: create_doc
parameters:
  title: "Sprint 12 Report"
  text: |
    # Sprint 12 Report

    **Completed:** 24 tasks
    **Carried over:** 6 tasks
    **Active blockers:** 2

    ## Highlights
    - [summarize key completions]

    ## Carry-over
    - [list notable incomplete tasks]

    ## Blockers
    - [list blocked tasks with blocker context]
  folder: "Reports"
```

---

## Recipe: Priority Recalibration

**When:** 「萬物皆P5」——優先級膨脹，失去意義。

**Step 1 — 預覽影響範圍：**
```yaml
tool_name: execute_dartql
parameters:
  query: "WHERE dartboard = 'Backlog' AND priority >= 3"
  dry_run: true
```

**Step 2 — 重置所有Backlog優先級至P2基線：**
```yaml
tool_name: execute_dartql
parameters:
  query: "UPDATE WHERE dartboard = 'Backlog' AND priority >= 3 SET priority = 2 COMMENT 'Priority recalibrated — re-triage needed'"
  dry_run: false
```

**Step 3 — 手動重新分類。**
逐一審閱Backlog，設置有意圖之優先級：
- P5: 正在阻塞生產或影響客戶
- P4: 本迭代必須交付
- P3: 下迭代計劃
- P2: 有意圖之Backlog
- P1: 也許有一天

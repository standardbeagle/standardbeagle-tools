---
name: recurring-tasks
description: Repeating task patterns - template tasks, CSV-based recurring creation, DartQL cloning, scheduled generation, and date rotation with dart-query. 模板、CSV、DartQL克隆、排程生成、日期輪轉諸法實現重複任務. Use when: create recurring tasks, set up sprint ceremonies, clone tasks for next sprint, schedule weekly standups, automate periodic task creation
---

# Recurring Tasks with dart-query

Dart無內建重複任務。諸模式藉dart-query工具，以模板、CSV導入、Claude Code排程實現同效。擇適合工作流之模式。

## Access Pattern (all examples below use this)

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "<tool-name>"
  parameters: { ... }
```

---

## Pattern 1: Template Tasks

**How:** 創建標記`template`之任務作藍本。以`get_task`讀取後，`create_task`修改字段創建實例。

**Steps:**
1. 一次性創建模板任務：
   ```yaml
   tool_name: create_task
   parameters:
     title: "[TEMPLATE] Weekly Standup"
     dartboard: "Templates"
     tags: ["template", "standup"]
     description: "Review blockers, share progress, align on priorities."
     priority: 3
   ```
2. 創建實例，先讀模板：
   ```yaml
   tool_name: get_task
   parameters:
     dart_id: "<template-task-id>"
     include_relationships: true
   ```
3. 以更新字段創建實例：
   ```yaml
   tool_name: create_task
   parameters:
     title: "Weekly Standup - Mon Apr 14"
     dartboard: "Current Sprint"
     tags: ["standup"]
     description: "<copied from template>"
     start_at: "2026-04-14T09:00:00Z"
     due_at: "2026-04-14T09:30:00Z"
     related_ids: ["<template-task-id>"]
   ```

**Example:** 一個`[TEMPLATE] Weekly Standup` → 每迭代五個週一晨會實例。

---

## Pattern 2: CSV Recurring Creation

**How:** 維護含重複任務定義之CSV文件。調整日期，每期開始時導入。

**Steps:**
1. 創建`sprint-ceremonies.csv`：
   ```
   title,description,priority,status,start_at,due_at,dartboard
   Sprint Planning,Define sprint goals and commit to tasks,High,Todo,2026-04-14T10:00:00Z,2026-04-14T12:00:00Z,Sprint 5
   Daily Standup Mon,Team sync,Medium,Todo,2026-04-14T09:00:00Z,2026-04-14T09:15:00Z,Sprint 5
   Daily Standup Tue,Team sync,Medium,Todo,2026-04-15T09:00:00Z,2026-04-15T09:15:00Z,Sprint 5
   Daily Standup Wed,Team sync,Medium,Todo,2026-04-16T09:00:00Z,2026-04-16T09:15:00Z,Sprint 5
   Daily Standup Thu,Team sync,Medium,Todo,2026-04-17T09:00:00Z,2026-04-17T09:15:00Z,Sprint 5
   Daily Standup Fri,Team sync,Medium,Todo,2026-04-18T09:00:00Z,2026-04-18T09:15:00Z,Sprint 5
   Sprint Review,Demo completed work to stakeholders,High,Todo,2026-04-25T14:00:00Z,2026-04-25T15:00:00Z,Sprint 5
   Sprint Retro,Reflect and improve the process,Medium,Todo,2026-04-25T15:00:00Z,2026-04-25T16:00:00Z,Sprint 5
   ```
2. 先驗證（必須）：
   ```yaml
   tool_name: import_tasks_csv
   parameters:
     csv_file_path: "/path/to/sprint-ceremonies.csv"
     validate_only: true
   ```
3. 審閱驗證輸出後執行導入：
   ```yaml
   tool_name: import_tasks_csv
   parameters:
     csv_file_path: "/path/to/sprint-ceremonies.csv"
     validate_only: false
   ```

**Example:** 每種典儀保留一份CSV，更新日期，迭代開始時導入。

> Invoke the `Skill` tool with `skill: dart-query:batch-ops` — 完整`import_tasks_csv`參數及安全協議。

---

## Pattern 3: DartQL Clone Pattern

**How:** 查找符合條件之現有任務，為下一期創建新版本。

**Steps:**
1. 先預覽待克隆任務（乾跑）：
   ```yaml
   tool_name: execute_dartql
   parameters:
     query: "UPDATE WHERE tags CONTAINS 'recurring' AND dartboard = 'Templates' SET priority = 3"
     dry_run: true
   ```
2. 每匹配任務創建日期位移之新實例：
   ```yaml
   tool_name: create_task
   parameters:
     title: "<matched title> - Sprint 6"
     dartboard: "Sprint 6"
     tags: ["recurring"]
     description: "<matched description>"
     start_at: "<original start + 14 days>"
     due_at: "<original due + 14 days>"
   ```
3. 可選標記原任務已克隆：
   ```yaml
   tool_name: execute_dartql
   parameters:
     query: "UPDATE WHERE tags CONTAINS 'recurring' AND dartboard = 'Templates' SET tags = ['recurring', 'cloned'] COMMENT 'Cloned for Sprint 6'"
     dry_run: false
   ```

**Example:** Templates看板含`recurring`標籤 → 一次DartQL將全部克隆至新迭代看板。

> Invoke the `Skill` tool with `skill: dart-query:batch-ops` — 完整DartQL語法參考。

---

## Pattern 4: Scheduled Creation with Claude Code

**How:** 以Claude Code之`/schedule`命令按cron排程自動創建任務。

**Setup:** 運行`/schedule`，提供如下提示：

```
Every Monday at 8am, create a Weekly Standup task in the Current Sprint dartboard
using the template at task ID <template-id>. Set start_at to 9:00am Monday,
due_at to 9:30am Monday, and tag it 'standup'.
```

**常用排程：**

| Frequency | Use case | Cron |
|-----------|----------|------|
| Every Monday | Weekly standup tasks for the week | `0 8 * * 1` |
| Biweekly Monday | Sprint ceremony import | `0 8 1-31/14 * 1` |
| 1st of month | Monthly review/audit tasks | `0 8 1 * *` |
| Weekdays | Daily standup task | `0 8 * * 1-5` |

**排程代理示例提示：**
```
Read the [TEMPLATE] Weekly Standup task from the Templates dartboard.
Create a copy in the Current Sprint dartboard with:
- Title: "Weekly Standup - {next Monday's date}"
- start_at: next Monday 9:00am UTC
- due_at: next Monday 9:30am UTC
- tags: ["standup"] (no "template" tag)
```

---

## Pattern 5: Date Rotation

**How:** 克隆任務時按固定間隔位移日期。

**常用間隔：**

```
Weekly:     start_at + 7 days,  due_at + 7 days
Biweekly:   start_at + 14 days, due_at + 14 days
Monthly:    same day, next month (e.g. Apr 14 → May 14)
From today: start_at = today + N days (absolute positioning)
```

**具體示例——雙週迭代輪轉：**

Sprint 5計劃為`2026-04-14T10:00:00Z` → `2026-04-14T12:00:00Z`

Sprint 6計劃：
```yaml
tool_name: create_task
parameters:
  title: "Sprint Planning - Sprint 6"
  dartboard: "Sprint 6"
  start_at: "2026-04-28T10:00:00Z"   # +14 days
  due_at: "2026-04-28T12:00:00Z"     # +14 days
  priority: 4
  tags: ["ceremony", "planning"]
```

**月度輪轉注意：** 使用日曆算術——勿簡單加30天。5月31日加1月 = 6月30日，非7月1日。

---

## Choosing the Right Pattern

| Situation | Best pattern |
|-----------|-------------|
| Same task every week | Template + Schedule (Patterns 1 + 4) |
| Batch of tasks per sprint | CSV import (Pattern 2) |
| Ad-hoc cloning from existing tasks | DartQL clone (Pattern 3) |
| Full automation, no manual steps | Schedule + any pattern above (Pattern 4) |
| One-time period rollover | Date rotation (Pattern 5) |

## Related Skills

`create_task`、`get_task`參數詳情：

> Invoke the `Skill` tool with `skill: dart-query:task-crud` — 任務創讀更刪及關係管理。

批量操作、`execute_dartql`、`import_tasks_csv`、DartQL語法、安全協議：

> Invoke the `Skill` tool with `skill: dart-query:batch-ops` — 批量操作完整參考。

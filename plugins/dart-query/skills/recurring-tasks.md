---
name: recurring-tasks
description: Repeating task patterns - template tasks, CSV-based recurring creation, DartQL cloning, scheduled generation, and date rotation with dart-query
---

# Recurring Tasks with dart-query

Dart doesn't have built-in recurring tasks. These patterns use dart-query tools to achieve the same result through templates, CSV imports, and Claude Code scheduling. Pick the pattern that fits your workflow.

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

**How:** Create a task tagged `template` as the blueprint. Clone it by reading with `get_task`, then `create_task` with modified fields.

**Steps:**
1. Create the template task once:
   ```yaml
   tool_name: create_task
   parameters:
     title: "[TEMPLATE] Weekly Standup"
     dartboard: "Templates"
     tags: ["template", "standup"]
     description: "Review blockers, share progress, align on priorities."
     priority: 3
   ```
2. To create an instance, read the template:
   ```yaml
   tool_name: get_task
   parameters:
     dart_id: "<template-task-id>"
     include_relationships: true
   ```
3. Create the instance with updated fields:
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

**Example:** One `[TEMPLATE] Weekly Standup` → five Monday standup instances per sprint.

---

## Pattern 2: CSV Recurring Creation

**How:** Maintain a CSV file with recurring task definitions. Adjust dates and import at the start of each period.

**Steps:**
1. Create `sprint-ceremonies.csv`:
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
2. Validate first (mandatory):
   ```yaml
   tool_name: import_tasks_csv
   parameters:
     csv_file_path: "/path/to/sprint-ceremonies.csv"
     validate_only: true
   ```
3. Execute import after reviewing the validation output:
   ```yaml
   tool_name: import_tasks_csv
   parameters:
     csv_file_path: "/path/to/sprint-ceremonies.csv"
     validate_only: false
   ```

**Example:** Keep one CSV per ceremony type. Update dates, run import at sprint start.

> See the `batch-ops` skill for full `import_tasks_csv` parameters and safety protocol.

---

## Pattern 3: DartQL Clone Pattern

**How:** Find existing tasks matching criteria and create new versions for the next period.

**Steps:**
1. Preview tasks to clone (dry run first):
   ```yaml
   tool_name: execute_dartql
   parameters:
     query: "UPDATE WHERE tags CONTAINS 'recurring' AND dartboard = 'Templates' SET priority = 3"
     dry_run: true
   ```
2. For each matched task, create a new instance with shifted dates:
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
3. Optionally mark originals as cloned:
   ```yaml
   tool_name: execute_dartql
   parameters:
     query: "UPDATE WHERE tags CONTAINS 'recurring' AND dartboard = 'Templates' SET tags = ['recurring', 'cloned'] COMMENT 'Cloned for Sprint 6'"
     dry_run: false
   ```

**Example:** Templates dartboard with `recurring` tag → one DartQL pass clones everything to the new sprint dartboard.

> See the `batch-ops` skill for full DartQL syntax reference.

---

## Pattern 4: Scheduled Creation with Claude Code

**How:** Use Claude Code's `/schedule` command to create tasks automatically on a cron schedule.

**Setup:** Run `/schedule` and provide a prompt like:

```
Every Monday at 8am, create a Weekly Standup task in the Current Sprint dartboard
using the template at task ID <template-id>. Set start_at to 9:00am Monday,
due_at to 9:30am Monday, and tag it 'standup'.
```

**Common schedules:**

| Frequency | Use case | Cron |
|-----------|----------|------|
| Every Monday | Weekly standup tasks for the week | `0 8 * * 1` |
| Biweekly Monday | Sprint ceremony import | `0 8 1-31/14 * 1` |
| 1st of month | Monthly review/audit tasks | `0 8 1 * *` |
| Weekdays | Daily standup task | `0 8 * * 1-5` |

**Example prompt for a scheduled agent:**
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

**How:** Shift dates by fixed intervals when cloning tasks.

**Common intervals:**

```
Weekly:     start_at + 7 days,  due_at + 7 days
Biweekly:   start_at + 14 days, due_at + 14 days
Monthly:    same day, next month (e.g. Apr 14 → May 14)
From today: start_at = today + N days (absolute positioning)
```

**Concrete example — biweekly sprint rotation:**

Sprint 5 planning was `2026-04-14T10:00:00Z` → `2026-04-14T12:00:00Z`

Sprint 6 planning:
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

**Monthly rotation note:** Use calendar arithmetic — don't just add 30 days. May 31 + 1 month = June 30, not July 1.

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

- `task-crud` — `create_task`, `get_task` parameter details
- `batch-ops` — `execute_dartql`, `import_tasks_csv`, DartQL syntax, safety protocol

---
name: batch-ops
description: dart-query batch operations - execute_dartql (recommended), batch update/delete, DartQL SQL-92 syntax, CSV import, safety protocols
---

# dart-query Batch Operations

Bulk operations on tasks: execute DartQL statements, batch update/delete, and CSV import.

## Access Pattern (all examples below use this)

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "<tool-name>"
  parameters: { ... }
```

---

## Safety Protocol — MANDATORY

```yaml
NEVER_SKIP:
  1: "ALWAYS dry_run: true first"
  2: "Review matched tasks before executing"
  3: "batch_delete requires confirm: true"
  4: "CSV import requires validate_only: true first"
```

---

## DartQL Selector Syntax

DartQL uses standard **SQL-92 WHERE clause syntax**. If you know SQL, you know DartQL.

**Operators:** `=`, `!=`, `<>`, `>`, `>=`, `<`, `<=`, `AND`, `OR`, `NOT`, `LIKE` (with `%` and `_` wildcards), `IN`, `NOT IN`, `BETWEEN`, `IS NULL`, `IS NOT NULL`, `CONTAINS` (aliases: `INCLUDES`, `HAS`), parentheses for grouping. Strings use single quotes.

**Available fields:**
```yaml
text:     title, description, status, dartboard, assignee  # singular in WHERE, maps to assignees array
string:   priority, size  # string values from get_config (e.g. "Critical", "High")
date:     due_at, start_at, created_at, updated_at, completed_at  # ISO8601
id:       parent_task, dart_id  # use IS NULL / IS NOT NULL
array:    tags, subtask_ids, blocker_ids, blocking_ids, duplicate_ids, related_ids
```

> **Note:** Status and priority names are workspace-specific. Use `get_config` to discover your workspace's values. Examples below use common defaults — yours may differ (e.g. "To-do" vs "Todo", "Doing" vs "In Progress").

**Examples:**
```sql
status = 'To-do' AND priority >= 4
status IN ('To-do', 'Doing') AND dartboard = 'Sprint 5'
title LIKE '%authentication%'
due_at BETWEEN '2026-02-15' AND '2026-02-28'
tags CONTAINS 'urgent' AND assignee IS NOT NULL
```

---

## execute_dartql — Recommended

The preferred tool for batch operations. Supports UPDATE and DELETE with SQL-92 WHERE clauses.

**Features:**
- Template variables: `SET title = 'DONE: {title}'` — interpolates per-task field values
- Inline COMMENT: `UPDATE WHERE ... SET ... COMMENT 'reason'` — adds comment to each matched task
- Multi-statement: chain operations with `;` separator
- Array literals: `SET blocker_ids = ['id1', 'id2']`

**Parameters:**
- `query` (string, required) — DartQL statement(s)
- `dry_run` (boolean, default `true`) — preview matches without modifying
- `concurrency` (integer, default `5`, range `1-20`)

**Example — simple status update (always dry_run first):**
```yaml
tool_name: execute_dartql
parameters:
  query: "UPDATE WHERE status = 'Todo' AND priority >= 4 SET status = 'In Progress'"
  dry_run: true
```

**Example — template variable (prefix title per task):**
```yaml
tool_name: execute_dartql
parameters:
  query: "UPDATE WHERE dartboard = 'Sprint 5' AND status = 'Done' SET title = 'DONE: {title}' COMMENT 'Sprint completed'"
  dry_run: false
  concurrency: 10
```

**Example — multi-statement (update then delete):**
```yaml
tool_name: execute_dartql
parameters:
  query: "UPDATE WHERE status = 'In Progress' SET priority = 3; DELETE WHERE status = 'Done' AND updated_at < '2026-01-01' CONFIRM;"
  dry_run: true
```

**Example — use as query tool (dry_run returns matches without modifying):**
```yaml
tool_name: execute_dartql
parameters:
  query: "UPDATE WHERE tags CONTAINS 'urgent' AND assignee IS NULL SET status = 'Todo'"
  dry_run: true
```

---

## batch_update_tasks — Deprecated (use execute_dartql)

Still functional but `execute_dartql` is preferred for new workflows.

**Parameters:**
- `selector` (string) — DartQL WHERE clause
- `updates` (object) — fields to update (same fields as `update_task`)
- `dry_run` (boolean, default `true`)
- `concurrency` (integer)

Relationship arrays (`blocker_ids`, `subtask_ids`, etc.) use **full replacement** — set `[]` to clear.

**Example:**
```yaml
tool_name: batch_update_tasks
parameters:
  selector: "status = 'Todo' AND dartboard = 'Backlog'"
  updates:
    priority: 3
    tags: ["needs-triage"]
  dry_run: true
```

---

## batch_delete_tasks — Deprecated (use execute_dartql)

Extra safety: requires `confirm: true` when `dry_run: false`.

**Parameters:**
- `selector` (string) — DartQL WHERE clause
- `dry_run` (boolean, default `true`)
- `confirm` (boolean) — **REQUIRED** when `dry_run: false`
- `concurrency` (integer)

**Example:**
```yaml
tool_name: batch_delete_tasks
parameters:
  selector: "status = 'Done' AND completed_at < '2025-12-01'"
  dry_run: false
  confirm: true
  concurrency: 5
```

---

## get_batch_status

Poll the status of a running or completed batch operation.

**Parameters:**
- `batch_operation_id` (string) — returned in the response from any batch operation

Operations are kept in memory for **1 hour** after completion.

**Example:**
```yaml
tool_name: get_batch_status
parameters:
  batch_operation_id: "batch_abc123"
```

---

## import_tasks_csv

Bulk-create tasks from CSV data. Always validate before importing.

**Parameters:**
- `dartboard` (string, required) — target dartboard dart_id or name
- `csv_data` (string) — inline CSV content
- `csv_file_path` (string) — path to CSV file (one of `csv_data` or `csv_file_path` required)
- `column_mapping` (object) — map CSV headers to task fields
- `validate_only` (boolean, default `true`) — parse and validate without creating tasks
- `continue_on_error` (boolean, default `true`) — skip invalid rows and continue
- `concurrency` (integer)

**Workflow:** `validate_only: true` → review report → set `validate_only: false` to execute.

**Standard CSV format** (headers match task field names directly):
```csv
title,status,priority,assignee,due_at
"Fix login bug",Todo,2,user@example.com,2026-05-01
"Update docs",Todo,4,,
```

**Custom column mapping** (when CSV headers differ from field names):
```yaml
column_mapping:
  "Task Name": title
  "Owner": assignee
  "Due Date": due_at
  "Urgency": priority
```

**Example — inline CSV with validation:**
```yaml
tool_name: import_tasks_csv
parameters:
  dartboard: "Sprint 6"
  csv_data: |
    title,status,priority,due_at
    "Implement OAuth",Todo,2,2026-05-15
    "Write unit tests",Todo,3,2026-05-20
  validate_only: true
```

**Example — file import with custom mapping:**
```yaml
tool_name: import_tasks_csv
parameters:
  dartboard: "Backlog"
  csv_file_path: "/tmp/tasks-export.csv"
  column_mapping:
    "Task Name": title
    "Priority Level": priority
    "Assigned To": assignee
  validate_only: false
  continue_on_error: true
  concurrency: 8
```

---

## Concurrency Tuning

Default `5` is safe for most operations.

- **1-2** — relationship fields (`blocker_ids`, `subtask_ids`), status transitions with side-effects
- **5** (default) — mixed field updates
- **10-20** — simple field updates (`priority`, `title`) on large batches (100+ tasks)

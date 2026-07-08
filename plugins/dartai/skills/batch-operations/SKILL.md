---
name: dartai-batch-operations
description: "Master dart-query batch operations - DartQL selectors, batch_update_tasks, batch_delete_tasks, CSV import, safety protocols. 批量操作dart-query：DartQL選擇器、批量更新刪除、CSV匯入、安全規程。 Use when: bulk update tasks, batch delete, import CSV, sprint transition, mass status change"
disable-model-invocation: true
---

# Batch Operations with dart-query

dart-query批量操作使用DartQL——類SQL查詢語言，選擇任務。大規模管理任務，此為最強功能。

> **Preferred tool**: Use `execute_dartql` for batch operations — it supports template variables, inline comments, and multi-statement execution. `batch_update_tasks` and `batch_delete_tasks` still work but are less flexible.
> ```yaml
> tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
> params:
>   mcp_name: "dart-query"
>   tool_name: "execute_dartql"
>   parameters:
>     query: "UPDATE WHERE status = 'Todo' AND dartboard = 'Sprint 5' SET status = 'In Progress' COMMENT 'Bulk started'"
>     dry_run: true
> ```

> Invoke the `Skill` tool with `skill: dartai:dart-query-reference` — 查完整slop-mcp調用模式。

### execute_dartql Advantages Over batch_update_tasks
- **Template variables**: `SET title = 'DONE: {title}'` — interpolates per-task
- **Inline COMMENT**: `UPDATE WHERE ... SET ... COMMENT 'reason'` — adds comment to each matched task
- **Multi-statement**: `UPDATE WHERE ...; DELETE WHERE ... CONFIRM;` — chain operations
- **Array literals**: `SET blocker_ids = ['id1', 'id2']`

## Safety Protocol - MANDATORY

```yaml
NEVER_SKIP:
  1: "ALWAYS dry_run: true first"
  2: "Review matched tasks before executing"
  3: "batch_delete requires confirm: true"
  4: "CSV import requires validate_only: true first"

execution_order:
  step_1: "Write selector"
  step_2: "Run with dry_run: true"
  step_3: "Review matched count and task list"
  step_4: "If correct, run with dry_run: false"
  step_5: "Check batch status for completion"
```

---

## DartQL Selector Syntax

DartQL使用**標準SQL-92 WHERE子句語法**。知SQL則知DartQL。

**Supported operators**: `=`, `!=`, `<>`, `>`, `>=`, `<`, `<=`, `AND`, `OR`, `NOT`, `LIKE` (with `%` and `_` wildcards), `IN`, `NOT IN`, `BETWEEN`, `IS NULL`, `IS NOT NULL`, `CONTAINS` (aliases: `INCLUDES`, `HAS`), parentheses for grouping. Strings use single quotes.

### Available Fields

```yaml
text:     title, description, status, dartboard, assignee  # assignee is singular in WHERE
string:   priority, size  # string values from get_config (e.g. "Critical", "High")
date:     due_at, start_at, created_at, updated_at, completed_at  # ISO8601 values
id:       parent_task, dart_id  # use IS NULL / IS NOT NULL
array:    tags, subtask_ids, blocker_ids, blocking_ids, duplicate_ids, related_ids
```

> **Note:** Status and priority names are workspace-specific. Use `get_config` to discover your workspace's actual values.

### Examples

```sql
status = 'Todo' AND priority >= 4
(status = 'Todo' OR status = 'In Progress') AND dartboard = 'Sprint 5'
title LIKE '%authentication%'
due_at < '2026-02-15' AND due_at IS NOT NULL
completed_at IS NULL AND updated_at < '2025-11-15'
```

---

## batch_update_tasks

### Schema
```yaml
required:
  selector: string   # DartQL WHERE clause
  updates: object    # Fields to change

optional:
  dry_run: boolean      # Default: TRUE
  concurrency: integer  # Default 5, range 1-20

updates_fields:
  title: string
  description: string
  status: string           # dart_id or name
  priority: integer        # 1-5
  size: integer            # 1-5
  start_at: string         # ISO8601
  due_at: string           # ISO8601
  assignees: [string]      # dart_ids, names, or emails
  tags: [string]           # dart_ids or names
  dartboard: string        # dart_id or name
  parent_task: string      # dart_id

  # Relationships (FULL REPLACEMENT - set [] to clear)
  subtask_ids: [string]
  blocker_ids: [string]
  blocking_ids: [string]
  duplicate_ids: [string]
  related_ids: [string]
```

### Common Patterns

#### Bulk Status Change
```yaml
# Move all sprint Todo tasks to In Progress
# Step 1: Preview
batch_update_tasks:
  selector: "dartboard = 'Sprint 5' AND status = 'Todo'"
  updates:
    status: "In Progress"
  dry_run: true

# Step 2: Execute (after reviewing preview)
batch_update_tasks:
  selector: "dartboard = 'Sprint 5' AND status = 'Todo'"
  updates:
    status: "In Progress"
  dry_run: false
```

#### Bulk Priority Adjustment
```yaml
# Escalate overdue tasks to critical priority
batch_update_tasks:
  selector: "due_at < '2026-02-15' AND status != 'Done' AND priority < 5"
  updates:
    priority: 5
  dry_run: true
```

#### Bulk Reassignment
```yaml
# Reassign all of departing team member's tasks
batch_update_tasks:
  selector: "assignee = 'jane@company.com' AND status != 'Done'"
  updates:
    assignees: ["john_dart_id"]
  dry_run: true
```

#### Bulk Tag Application
```yaml
# Tag all high-priority bugs
batch_update_tasks:
  selector: "priority >= 4 AND title LIKE '%bug%'"
  updates:
    tags: ["urgent_tag_id", "bug_tag_id"]
  dry_run: true
```

#### Move Tasks Between Dartboards
```yaml
# Move completed sprint tasks to archive
batch_update_tasks:
  selector: "dartboard = 'Sprint 4' AND status = 'Done'"
  updates:
    dartboard: "Archive"
  dry_run: true
```

#### Bulk Date Setting
```yaml
# Set due dates for all unscheduled sprint tasks
batch_update_tasks:
  selector: "dartboard = 'Sprint 5' AND due_at IS NULL AND status = 'Todo'"
  updates:
    due_at: "2026-02-28T23:59:59Z"
  dry_run: true
```

#### Clear Relationships in Bulk
```yaml
# Remove all blocker relationships from done tasks
batch_update_tasks:
  selector: "status = 'Done' AND dartboard = 'Sprint 5'"
  updates:
    blocker_ids: []
    blocking_ids: []
  dry_run: true
```

#### Bulk Relationship Management
```yaml
# Make all tasks on a dartboard subtasks of a parent
batch_update_tasks:
  selector: "dartboard = 'Sprint 5' AND status = 'Todo' AND parent_task IS NULL"
  updates:
    parent_task: "epic_task_dart_id"
  dry_run: true

# Clear all duplicate links from archived tasks
batch_update_tasks:
  selector: "status = 'Archived' AND dartboard = 'Backlog'"
  updates:
    duplicate_ids: []
    related_ids: []
  dry_run: true

# Add blocking relationship to all high-priority tasks
# (they block a release gate task)
batch_update_tasks:
  selector: "dartboard = 'Sprint 5' AND priority >= 4 AND status != 'Done'"
  updates:
    blocking_ids: ["release_gate_task_id"]
  dry_run: true
```

**NOTE on batch blocker updates:** `batch_update_tasks` uses **full replacement** for relationship arrays just like `update_task`. When updating `blocker_ids` or `blocking_ids` in bulk, the same array is applied to ALL matched tasks. This works well for:
- Clearing relationships: `blocker_ids: []`
- Setting a shared blocker: `blocker_ids: ["shared_blocker_id"]`
- Setting a shared blocking target: `blocking_ids: ["release_task_id"]`

每任務需不同關係值時，用個別`update_task`調用配合讀-改-寫模式。

---

### Advanced DartQL Patterns

#### Complex Date + Priority Queries
```sql
-- Overdue high-priority tasks that aren't blocked
(due_at < '2026-02-15' AND priority >= 4 AND status != 'Done' AND status != 'Blocked')

-- Tasks started but not finished within 2 weeks
(start_at < '2026-02-01' AND status = 'In Progress' AND completed_at IS NULL)

-- Unscheduled work in active sprints
(dartboard = 'Sprint 5' AND due_at IS NULL AND start_at IS NULL AND status = 'Todo')
```

#### Multi-Status Transitions
```yaml
# Move all review tasks to done
batch_update_tasks:
  selector: "status = 'In Review' AND dartboard = 'Sprint 5'"
  updates:
    status: "Done"
  dry_run: true

# Escalate stale in-progress tasks
batch_update_tasks:
  selector: "status = 'In Progress' AND updated_at < '2026-02-01' AND dartboard = 'Sprint 5'"
  updates:
    priority: 5
    tags: ["needs-attention"]
  dry_run: true
```

#### Combined Field + Relationship Updates
```yaml
# Archive completed sprint tasks and clear relationships
batch_update_tasks:
  selector: "dartboard = 'Sprint 4' AND status = 'Done'"
  updates:
    dartboard: "Archive"
    status: "Archived"
    blocker_ids: []
    blocking_ids: []
    related_ids: []
  dry_run: true

# Prepare tasks for new sprint - reset status and set dates
batch_update_tasks:
  selector: "dartboard = 'Sprint 5' AND status = 'Todo'"
  updates:
    start_at: "2026-02-17T00:00:00Z"
    due_at: "2026-02-28T23:59:59Z"
  dry_run: true
```

---

## batch_delete_tasks

### Schema
```yaml
required:
  selector: string   # DartQL WHERE clause

optional:
  dry_run: boolean      # Default: TRUE
  confirm: boolean      # REQUIRED when dry_run=false
  concurrency: integer  # Default 5, range 1-20
```

### DANGER - Extra Safety Required

```yaml
safety_protocol:
  step_1: "ALWAYS dry_run: true first"
  step_2: "Check matched count carefully"
  step_3: "Verify selector is specific enough"
  step_4: "When ready: dry_run: false AND confirm: true"

  NEVER:
    - "Run without dry_run first"
    - "Use broad selectors like status = 'Done'"
    - "Delete across all dartboards without dartboard filter"
```

### Patterns

#### Clean Up Old Archived Tasks
```yaml
# Preview: archived tasks older than 6 months
batch_delete_tasks:
  selector: "status = 'Archived' AND completed_at < '2025-08-01'"
  dry_run: true

# Execute (ONLY after reviewing preview)
batch_delete_tasks:
  selector: "status = 'Archived' AND completed_at < '2025-08-01'"
  dry_run: false
  confirm: true
```

#### Remove Test/Scratch Tasks
```yaml
# Preview: tasks with [TEST] prefix
batch_delete_tasks:
  selector: "title LIKE '[TEST]%'"
  dry_run: true
```

#### Clean Specific Dartboard
```yaml
# Preview: all tasks on a specific dartboard
batch_delete_tasks:
  selector: "dartboard = 'Scratch Pad' AND status = 'Done'"
  dry_run: true
```

---

## Using Batch as a Query Tool

`batch_update_tasks`配`dry_run: true`，是強力查詢工具，過濾比`list_tasks`更豐富。

```yaml
# Use as query: find tasks matching complex criteria
# The dry_run preview shows matched tasks without modifying them

# Find all high-priority tasks due this week across all dartboards
batch_update_tasks:
  selector: "priority >= 4 AND due_at >= '2026-02-15' AND due_at < '2026-02-22'"
  updates:
    priority: 4  # Same value - no actual change even if dry_run were false
  dry_run: true

# Find tasks with no assignee and no due date
batch_update_tasks:
  selector: "assignee IS NULL AND due_at IS NULL AND status = 'Todo'"
  updates:
    priority: 1  # Placeholder - won't execute
  dry_run: true

# Complex query: overdue OR high priority unassigned
batch_update_tasks:
  selector: "(due_at < '2026-02-15' AND status != 'Done') OR (priority >= 4 AND assignee IS NULL)"
  updates:
    priority: 5  # Placeholder
  dry_run: true
```

---

## import_tasks_csv

### Schema
```yaml
required:
  dartboard: string  # Target dartboard (dart_id or name)

one_of:
  csv_data: string       # Inline CSV string
  csv_file_path: string  # Path to .csv file

optional:
  column_mapping: object     # Map CSV headers to dart fields
  validate_only: boolean     # Default: TRUE
  continue_on_error: boolean # Default: true
  concurrency: integer       # Default 5, range 1-20
```

### Standard CSV Format
```csv
title,description,status,priority,assignee,due_at,tags
"Fix login bug","Users can't login with SSO",Todo,5,jane@company.com,2026-02-20,"bug,urgent"
"Add dark mode","Implement theme switching",Todo,3,,2026-03-01,"feature"
```

### Custom Column Mapping
```yaml
# When CSV headers don't match dart field names
import_tasks_csv:
  dartboard: "My Project"
  csv_file_path: "/path/to/export.csv"
  column_mapping:
    "Task Name": "title"
    "Details": "description"
    "Owner": "assignee"
    "Due Date": "due_at"
    "Priority Level": "priority"
  validate_only: true
```

### Import Workflow

```yaml
# Step 1: ALWAYS validate first
import_tasks_csv:
  dartboard: "Sprint 5"
  csv_data: "title,priority,status\nFix bug,5,Todo\nAdd feature,3,Todo"
  validate_only: true

# Step 2: Review validation results
# - Check for errors (invalid statuses, missing required fields)
# - Verify row count matches expectations
# - Check column mapping is correct

# Step 3: Execute import
import_tasks_csv:
  dartboard: "Sprint 5"
  csv_data: "title,priority,status\nFix bug,5,Todo\nAdd feature,3,Todo"
  validate_only: false

# Step 4: Check status
get_batch_status:
  batch_operation_id: "returned_from_step_3"
```

### Inline CSV for Quick Task Creation
```yaml
# Create multiple tasks at once
import_tasks_csv:
  dartboard: "Sprint 5"
  csv_data: |
    title,priority,status,description
    "Set up CI/CD pipeline",4,Todo,"Configure GitHub Actions for automated testing"
    "Write API documentation",3,Todo,"Document all REST endpoints"
    "Fix memory leak in worker",5,Todo,"Worker process grows unbounded after 2 hours"
    "Add rate limiting",4,Todo,"Prevent API abuse with per-user rate limits"
    "Update dependencies",2,Todo,"Run npm audit fix and update major versions"
  validate_only: true
```

---

## get_batch_status

### Schema
```yaml
required:
  batch_operation_id: string  # From batch_update/delete/import response
```

### Usage
```yaml
# After starting a batch operation
result = batch_update_tasks(...)

# Check progress
get_batch_status:
  batch_operation_id: result.batch_operation_id

# Returns: status, progress, errors, completed count
# Operations kept in memory for 1 hour
```

---

## Workflow Recipes

### Sprint Transition
```yaml
# End of sprint: move incomplete work to next sprint
# 1. Preview tasks to move
batch_update_tasks:
  selector: "dartboard = 'Sprint 4' AND status != 'Done'"
  updates:
    dartboard: "Sprint 5"
  dry_run: true

# 2. Archive completed work
batch_update_tasks:
  selector: "dartboard = 'Sprint 4' AND status = 'Done'"
  updates:
    dartboard: "Archive"
    status: "Archived"
  dry_run: true

# 3. Execute both (after review)
```

### Priority Recalibration
```yaml
# Reset all priorities on a dartboard for re-triage
batch_update_tasks:
  selector: "dartboard = 'Backlog' AND priority >= 3"
  updates:
    priority: 2
  dry_run: true
```

### Team Rebalancing
```yaml
# Find overloaded team member's tasks
batch_update_tasks:
  selector: "assignee = 'overloaded@company.com' AND status = 'Todo' AND priority < 4"
  updates:
    assignees: ["available@company.com"]
  dry_run: true
```

### Stale Task Cleanup
```yaml
# Find tasks not updated in 90 days
batch_update_tasks:
  selector: "updated_at < '2025-11-15' AND status != 'Done' AND status != 'Archived'"
  updates:
    tags: ["stale_tag_id"]
  dry_run: true

# Then review tagged tasks for archival
batch_delete_tasks:
  selector: "tags LIKE '%stale%' AND updated_at < '2025-08-01'"
  dry_run: true
```

### Bulk Task Creation via CSV
```yaml
# Import from project management tool export
import_tasks_csv:
  dartboard: "Migration"
  csv_file_path: "/tmp/jira-export.csv"
  column_mapping:
    "Summary": "title"
    "Description": "description"
    "Priority": "priority"
    "Assignee": "assignee"
    "Due Date": "due_at"
    "Labels": "tags"
  validate_only: true
```

---

## Concurrency Tuning

```yaml
concurrency_guidelines:
  default: 5              # Good for most operations
  conservative: 1-2       # When modifying relationships or critical data
  aggressive: 10-20       # For read-heavy or simple field updates

  when_to_lower:
    - "Updating relationships (ordering matters)"
    - "Modifying status (may trigger webhooks)"
    - "Moving between dartboards"

  when_to_raise:
    - "Simple field updates (priority, tags)"
    - "Large batches (500+ tasks)"
    - "Time-sensitive operations"
```

---

## Error Handling

```yaml
common_errors:
  invalid_selector:
    cause: "DartQL syntax error"
    fix: "Check SQL-like syntax, quote strings, verify field names"

  no_matches:
    cause: "Selector matches 0 tasks"
    fix: "Broaden selector, check dartboard/status spelling"

  partial_failure:
    cause: "Some tasks fail to update (permissions, validation)"
    action: "Check batch status for per-task errors"

  timeout:
    cause: "Too many tasks with low concurrency"
    fix: "Increase concurrency or narrow selector"
```

## Related

同一 dart-query API 之不同切面之姊妹參考技藝：

- `dartai:dart-query-reference` — 全工具總覽（24 工具）
- `dartai:task-filtering` — 查詢/過濾/分頁
- `dartai:task-relationships` — 子任務/阻塞/相關
- `dartai:workspace-docs` — 工作區文檔/評論/時間/附件

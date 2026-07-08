---
name: dartai-task-filtering
description: "Master dart-query filtering - list_tasks filters, search_tasks queries, detail levels, pagination, query composition patterns. 精通dart-query過濾：list_tasks過濾器、search_tasks查詢、詳情層級、分頁、查詢組合模式。 Use when: filter tasks by status, search tasks, paginate results, query by assignee, list by due date"
disable-model-invocation: true
---

# Task Filtering with dart-query

dart-query提供兩互補查詢工具：`list_tasks`用於結構化過濾，`search_tasks`用於全文發現。

> **Access Pattern**: Always call dart-query through slop-mcp:
> ```yaml
> tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
> params:
>   mcp_name: "dart-query"
>   tool_name: "list_tasks"  # or "search_tasks"
>   parameters: { ... }
> ```

> Invoke the `Skill` tool with `skill: dartai:dart-query-reference` — 查完整slop-mcp調用模式。

## list_tasks - Structured Filtering

### Available Filters

```yaml
filters:
  assignee: string      # dart_id, name, or email
  status: string        # dart_id or name (e.g., "Todo", "In Progress", "Done")
  dartboard: string     # dart_id or name
  priority: integer     # 1 (lowest) to 5 (highest)
  tags: [string]        # Array of tag dart_ids or names
  due_before: string    # ISO8601 date - tasks due before this date
  due_after: string     # ISO8601 date - tasks due after this date
  has_parent: boolean   # true = subtasks only, false = top-level tasks only

pagination:
  limit: integer        # Default 50, max 500
  offset: integer       # Skip N results (0-based)

response_control:
  detail_level: enum
    minimal:  "dart_id + title + parent_task + blocker_ids"
    standard: "dart_id + title + description + status + assignee + priority + dartboard + parent_task + blocker_ids (default)"
    full:     "All fields including relationships"
```

### Detail Levels - When to Use Each

```yaml
minimal:
  returns: [dart_id, title, parent_task, blocker_ids]
  use_when:
    - "Counting tasks matching criteria"
    - "Building selection lists"
    - "Quick scan of what exists"
    - "Feeding into batch operations"
  tokens: "~20 per task"

standard:
  returns: [dart_id, title, description, status, assignee, priority, dartboard, parent_task, blocker_ids]
  use_when:
    - "Dashboard views"
    - "Status reports"
    - "Triage and prioritization"
    - "Most common operations"
  tokens: "~50 per task"

full:
  returns: [all fields, relationships, dates, tags, size, description]
  use_when:
    - "Need relationship data (subtasks, blockers)"
    - "Exporting task details"
    - "Deep analysis of task structure"
    - "Checking dependencies before batch ops"
  tokens: "~200+ per task"
```

### Filter Composition Patterns

#### By Status
```yaml
# All todo tasks on a dartboard
list_tasks:
  dartboard: "My Project"
  status: "Todo"

# All in-progress tasks for an assignee
list_tasks:
  assignee: "jane@company.com"
  status: "In Progress"
```

#### By Priority
```yaml
# All high-priority tasks (priority 4-5)
# Note: list_tasks only supports exact priority match
# For ranges, use batch_update_tasks selector syntax
list_tasks:
  priority: 5
  dartboard: "My Project"

# Combine with status for triage
list_tasks:
  priority: 4
  status: "Todo"
  dartboard: "My Project"
```

#### By Due Date
```yaml
# Overdue tasks (due before today)
list_tasks:
  due_before: "2026-02-15T00:00:00Z"
  status: "In Progress"

# Due this week
list_tasks:
  due_after: "2026-02-15T00:00:00Z"
  due_before: "2026-02-22T00:00:00Z"

# No due date - can't filter for null, but can:
# 1. Get all tasks
# 2. Filter client-side for missing due_at
```

#### By Tags
```yaml
# Tasks with specific tag
list_tasks:
  tags: ["bug"]
  dartboard: "My Project"

# Multiple tags (AND logic - tasks must have ALL tags)
list_tasks:
  tags: ["bug", "urgent"]
```

#### By Parent Relationship
```yaml
# Top-level tasks only (no subtasks)
list_tasks:
  dartboard: "My Project"
  has_parent: false

# Subtasks only
list_tasks:
  dartboard: "My Project"
  has_parent: true

# NOTE: has_parent uses client-side filtering
# All tasks are fetched, then filtered locally
# Use with dartboard filter to limit API calls
```

#### Multi-Filter Combinations
```yaml
# Sprint planning: unassigned high-priority todos
list_tasks:
  dartboard: "Sprint 5"
  status: "Todo"
  priority: 5

# Deadline check: assigned tasks due this week
list_tasks:
  assignee: "john"
  due_after: "2026-02-15T00:00:00Z"
  due_before: "2026-02-22T00:00:00Z"

# Backlog triage: unblocked top-level todos
list_tasks:
  dartboard: "Backlog"
  status: "Todo"
  has_parent: false
  detail_level: full  # Need relationships to check blockers
```

---

## Pagination Strategies

### Sequential Pagination
```yaml
# Page 1
list_tasks:
  dartboard: "My Project"
  limit: 50
  offset: 0

# Page 2
list_tasks:
  dartboard: "My Project"
  limit: 50
  offset: 50

# Page 3
list_tasks:
  dartboard: "My Project"
  limit: 50
  offset: 100
```

### Efficient Full Scans
```yaml
# When you need ALL tasks from a dartboard:
# Use max limit to minimize API calls
list_tasks:
  dartboard: "My Project"
  detail_level: minimal  # Smallest response
  limit: 500             # Max per call

# For large dartboards (500+):
# Page through with offset
# Stop when result count < limit
```

### Count-First Pattern
```yaml
# Get count before deciding approach
step_1:
  list_tasks:
    dartboard: "My Project"
    detail_level: minimal
    limit: 1  # Just to see if any exist

step_2_if_many:
  # Use batch operations instead of iterating
  batch_update_tasks:
    selector: "dartboard = 'My Project' AND status = 'Todo'"
    updates: { status: "In Progress" }
    dry_run: true
```

---

## search_tasks - Full-Text Search

### Query Syntax

```yaml
basic_terms:
  query: "authentication login"
  # Matches tasks containing "authentication" OR "login"

quoted_phrases:
  query: '"user authentication"'
  # Matches exact phrase "user authentication"

exclusions:
  query: "authentication -test"
  # Matches "authentication" but NOT "test"

combined:
  query: '"login flow" authentication -test -mock'
  # Exact phrase "login flow", also "authentication",
  # exclude "test" and "mock"
```

### Parameters
```yaml
required:
  query: string

optional:
  dartboard: string          # Scope search to one dartboard
  include_completed: boolean # Default false - excludes Done/Archived
  limit: integer             # Default 50, max 500
```

### When to Use search_tasks vs list_tasks

```yaml
use_search_tasks:
  - "Finding tasks by content/description text"
  - "Discovering related tasks across dartboards"
  - "Free-text queries from user input"
  - "Finding tasks when you don't know the exact status/assignee"

use_list_tasks:
  - "Structured queries with known filter values"
  - "Status-based workflows (all Todo, all In Progress)"
  - "Assignee workload views"
  - "Date-based queries (overdue, due this week)"
  - "Priority-based triage"
  - "Parent/subtask hierarchy queries"
```

### Search Patterns

```yaml
# Find all tasks related to a feature
search_tasks:
  query: '"user profile" OR "user settings"'
  dartboard: "My Project"

# Find tasks mentioning a specific file
search_tasks:
  query: "auth.ts middleware"

# Find bugs excluding resolved
search_tasks:
  query: "bug crash error -resolved -wontfix"
  include_completed: false

# Find tasks for sprint planning
search_tasks:
  query: "sprint-5 OR backlog"
  dartboard: "My Project"
```

---

## Query Workflow Patterns

### Triage Pattern
```yaml
# 1. Get high priority unresolved tasks
list_tasks:
  dartboard: "My Project"
  priority: 5
  status: "Todo"
  detail_level: standard

# 2. Get overdue tasks
list_tasks:
  due_before: "2026-02-15T00:00:00Z"
  status: "In Progress"
  detail_level: standard

# 3. Search for related issues
search_tasks:
  query: "blocking critical"
  dartboard: "My Project"
```

### Status Report Pattern
```yaml
# For each status, get count
statuses: [Todo, "In Progress", "In Review", Done]

for_each_status:
  list_tasks:
    dartboard: "Sprint 5"
    status: "${status}"
    detail_level: minimal
    limit: 500
```

### Dependency Mapping Pattern
```yaml
# Get all tasks with full relationship data
list_tasks:
  dartboard: "My Project"
  detail_level: full
  has_parent: false  # Top-level only

# Then for each task with subtask_ids:
get_task:
  dart_id: "${task.dart_id}"
  expand_relationships: true  # Get subtask titles
```

### Workload Balancing Pattern
```yaml
# Get each assignee's task count
for_each_assignee:
  list_tasks:
    assignee: "${assignee_id}"
    status: "In Progress"
    detail_level: minimal
    limit: 500
```

---

## Filter Limitations & Workarounds

### What list_tasks Can't Do

```yaml
limitations:
  no_range_filters:
    problem: "Can't filter priority >= 3"
    workaround: "Use batch_update_tasks selector for DartQL ranges"

  no_null_filters:
    problem: "Can't filter for tasks with no due date"
    workaround: "Fetch all, filter client-side"

  no_or_logic:
    problem: "Can't filter status = Todo OR In Progress"
    workaround: "Make two calls, merge results"

  no_text_search:
    problem: "Can't search description text"
    workaround: "Use search_tasks for text queries"

  single_priority:
    problem: "Can only filter exact priority, not ranges"
    workaround: "Use DartQL: priority >= 3 in batch selectors"
```

### DartQL (in batch operations) vs list_tasks

DartQL用**標準SQL-92 WHERE子句語法**（完整參考見`batch-operations`技能）。支持list_tasks不能做的：範圍比較、AND/OR邏輯、LIKE、日期比較及IS NULL檢查。

> Invoke the `Skill` tool with `skill: dartai:batch-operations` — 查DartQL語法深度參考。

**用list_tasks**：有詳情層級控制、分頁及has_parent過濾的簡單結構化查詢（只讀，無需dry_run）。

**用DartQL**（`batch_update_tasks`加`dry_run: true`）：需要超出list_tasks命名參數的SQL-92過濾能力時。

---

## Performance Tips

```yaml
reduce_api_calls:
  - "Use max limit (500) for full scans instead of small pages"
  - "Use detail_level: minimal when you only need IDs"
  - "Cache get_config results - they rarely change"
  - "Use dartboard filter to scope queries"

reduce_tokens:
  - "detail_level: minimal for counts and ID lists"
  - "detail_level: standard for dashboards (skip relationships)"
  - "include_relationships: false on get_task for quick checks"
  - "include parameter on get_config to limit sections"

avoid_n_plus_1:
  - "Don't get_task for every result from list_tasks"
  - "Use detail_level: full on list_tasks instead"
  - "Use expand_relationships on get_task to get titles in one call"
  - "Batch operations instead of individual updates in loops"
```

## Related

同一 dart-query API 之不同切面之姊妹參考技藝：

- `dartai:dart-query-reference` — 全工具總覽（24 工具）
- `dartai:task-relationships` — 子任務/阻塞/相關
- `dartai:batch-operations` — 批量寫/DartQL/CSV
- `dartai:workspace-docs` — 工作區文檔/評論/時間/附件

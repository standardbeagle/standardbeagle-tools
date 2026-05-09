---
name: dart-query-querying
description: "dart-query task querying - list_tasks structured filtering, search_tasks full-text search, detail levels, pagination, and using execute_dartql for complex queries. 結構化過濾、全文搜索、詳細級別、分頁及DartQL複雜查詢. Use when: filter tasks by status, search tasks by text, list tasks by assignee, paginate task results, query with complex conditions"
disable-model-invocation: true
---

# dart-query Task Querying

## Access Pattern (all examples below use this)

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "<tool-name>"
  parameters: { ... }
```

---

## list_tasks — Structured Filtering

### Available Filters

```yaml
assignee:     string   # dart_id, name, or email
status:       string   # dart_id or name
dartboard:    string   # dart_id or name
priority:     integer  # 1-5, exact match only
tags:         [string] # dart_ids or names, AND logic
due_before:   string   # ISO8601 datetime
due_after:    string   # ISO8601 datetime
has_parent:   boolean  # true=subtasks only, false=top-level only
limit:        integer  # default 50, max 500
offset:       integer  # pagination
detail_level: string   # minimal | standard | full
```

### Detail Levels

| Level    | Fields Returned                                              | Tokens/Task | Use When                                    |
|----------|--------------------------------------------------------------|-------------|---------------------------------------------|
| minimal  | dart_id, title, parent_task, blocker_ids                    | ~20         | Counts, ID lists, feeding batch operations  |
| standard | + description, status, assignee, priority, dartboard        | ~50         | Dashboards, triage, sprint reviews          |
| full     | All fields including all relationships and custom fields     | ~200+       | Dependency mapping, exports, deep analysis  |

### Filter Composition Examples

**By status + dartboard:**
```yaml
tool_name: list_tasks
parameters:
  dartboard: "Sprint 24"
  status: "In Progress"
  detail_level: standard
```

**By assignee + due date range:**
```yaml
tool_name: list_tasks
parameters:
  assignee: "alice@example.com"
  due_after: "2026-04-01T00:00:00Z"
  due_before: "2026-04-30T23:59:59Z"
  detail_level: standard
```

**Unassigned high-priority tasks:**
```yaml
tool_name: list_tasks
parameters:
  priority: 1
  status: "Open"
  detail_level: standard
  limit: 100
```

**Top-level tasks only (no subtasks):**
```yaml
tool_name: list_tasks
parameters:
  dartboard: "Backlog"
  has_parent: false
  detail_level: minimal
```

**Multi-filter sprint planning:**
```yaml
tool_name: list_tasks
parameters:
  dartboard: "Q2 Planning"
  has_parent: false
  due_before: "2026-06-30T23:59:59Z"
  tags: ["feature", "approved"]
  detail_level: full
  limit: 500
```

### Pagination

**Sequential paging:**
```yaml
parameters:
  limit: 50
  offset: 100   # page 3 (0-indexed pages of 50)
```

**Full scan — stop when result count < limit:**
```yaml
parameters:
  limit: 500
  offset: 0    # increment by 500 each page until len(results) < 500
```

**Count-first — check if any exist before loading:**
```yaml
parameters:
  dartboard: "Backlog"
  status: "Blocked"
  limit: 1
  detail_level: minimal
```

---

## search_tasks — Full-Text Search

### Parameters

```yaml
query:             string   # required; supports "quoted phrases", -exclusions, terms
dartboard:         string   # RECOMMENDED — unscoped searches may return server errors
include_completed: boolean  # default false
limit:             integer  # default 50, max 500
```

### When to Use search_tasks vs list_tasks

| Use search_tasks when…                                    | Use list_tasks when…                              |
|-----------------------------------------------------------|---------------------------------------------------|
| Finding tasks by content/description text                 | Filtering by status, assignee, date, priority     |
| Discovering related tasks across dartboards               | Known field values with structured workflow       |
| Responding to a free-text user query ("find auth bugs")   | Building dashboards or feeding batch operations   |

### Examples

**Find feature-related tasks:**
```yaml
tool_name: search_tasks
parameters:
  query: "authentication feature"
  include_completed: false
  limit: 50
```

**Find bugs excluding resolved:**
```yaml
tool_name: search_tasks
parameters:
  query: "bug -resolved -wontfix"
  dartboard: "Mobile App"
  limit: 100
```

**Search across all dartboards for a phrase:**
```yaml
tool_name: search_tasks
parameters:
  query: '"rate limiting" OR "throttle"'
  include_completed: true
  limit: 200
```

---

## Complex Queries Beyond list_tasks

`list_tasks`僅支持精確匹配過濾——無範圍過濾（`priority >= 3`）、OR邏輯、空值判斷或LIKE匹配。此類情形用`execute_dartql`搭配`dry_run: true`，返回匹配任務而不修改任何數據。

**Example — find all high-priority open tasks:**
```yaml
tool_name: execute_dartql
parameters:
  query: "UPDATE WHERE priority >= 4 AND status != 'Done' SET priority = 4"
  dry_run: true
```
乾跑返回匹配任務，不執行更新。

完整DartQL語法及表達式參考：

> Invoke the `Skill` tool with `skill: dart-query:batch-ops` — DartQL語法完整參考。

---

## Performance Tips

- 全量掃描用`limit: 500`——減少往返次數
- 計數與ID收集用`detail_level: minimal`
- 以`dartboard`縮小查詢範圍
- 避免N+1：在`list_tasks`上用`detail_level: full`，勿逐條調用`get_task`
- 緩存`get_config`結果——工作區配置在會話內極少變化

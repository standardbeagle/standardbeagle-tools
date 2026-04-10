---
name: task-crud
description: dart-query task operations - create_task, get_task, update_task, delete_task, add_task_comment with relationship management and incremental updates
---

# dart-query Task CRUD

Create, read, update, and delete tasks in Dart. All tools use dart_id as the primary identifier.

## Access Pattern (all examples below use this)

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "<tool-name>"
  parameters: { ... }
```

---

## create_task — Create a New Task

**Required:**
- `title` (string, max 500 chars)
- `dartboard` (dart_id or name)

**Optional fields:**
```yaml
description: string          # markdown supported
status: string               # dart_id or name
priority: string             # "Critical", "High", "Medium", "Low" — values from get_config
size: 1-5                   # story points / effort
start_at: ISO8601            # "2026-04-10T09:00:00Z"
due_at: ISO8601
assignees: [dart_id, ...]
tags: [dart_id, ...]
parent_task: dart_id
comment: string              # adds comment after creation in same call
```

**Relationship fields** (dart_id arrays):
```yaml
subtask_ids: [dart_id, ...]
blocker_ids: [dart_id, ...]   # tasks blocking this one
blocking_ids: [dart_id, ...]  # tasks this one blocks
duplicate_ids: [dart_id, ...]
related_ids: [dart_id, ...]
```

### Example: Basic creation
```yaml
tool_name: create_task
parameters:
  title: "Implement OAuth login flow"
  dartboard: "Sprint 42"
  priority: 2
  assignees: ["usr_abc123"]
```

### Example: Creation with relationships and comment
```yaml
tool_name: create_task
parameters:
  title: "Fix auth token refresh"
  dartboard: "Sprint 42"
  priority: 1
  blocker_ids: ["tsk_xyz789"]
  comment: "Blocking release — needs immediate attention"
```

---

## get_task — Fetch a Single Task

**Required:**
- `dart_id` (string)

**Optional flags:**
- `include_comments` (boolean, default false) — include comment thread
- `include_relationships` (boolean, default true) — include related task IDs
- `expand_relationships` (boolean, default false) — fetch titles for related tasks (costs extra API calls)

**When to use each flag:**
- `include_relationships: false` — quick status checks; minimum payload
- `expand_relationships: true` — displaying task context to user; shows related task titles

### Example
```yaml
tool_name: get_task
parameters:
  dart_id: "tsk_abc123"
  include_comments: true
  expand_relationships: true
```

---

## update_task — Modify an Existing Task

**Required:**
- `dart_id` (also accepts `id` or `task_id`)

**CRITICAL: pass fields flat — NOT wrapped in `updates: {...}`** — this is the #1 mistake.

Same optional fields as `create_task`, plus:

**Incremental relationship updates** (avoid full replacement when only adding/removing):
```yaml
add_to:
  blocker_ids: [dart_id, ...]    # appends; fetches current, merges, deduplicates automatically
remove_from:
  blocker_ids: [dart_id, ...]    # removes matching IDs
```

**Rules:**
- Direct field assignment uses **full replacement semantics** — send `[]` to clear
- Cannot combine `add_to`/`remove_from` with direct field on the **same** relationship
- CAN combine `add_to` on one field with `remove_from` on a different field

### Example: Simple update
```yaml
tool_name: update_task
parameters:
  dart_id: "tsk_abc123"
  status: "In Progress"
  priority: 2
```

### Example: Add blocker with comment
```yaml
tool_name: update_task
parameters:
  dart_id: "tsk_abc123"
  comment: "Blocked on API design review"
  add_to:
    blocker_ids: ["tsk_xyz789"]
```

### Example: Incremental relationship update
```yaml
tool_name: update_task
parameters:
  dart_id: "tsk_abc123"
  add_to:
    related_ids: ["tsk_new111"]
  remove_from:
    blocker_ids: ["tsk_old999"]
```

---

## delete_task — Delete a Task

**Required:**
- `dart_id` (string)

Soft delete — recoverable via Dart web UI. The task is removed from all boards and queries immediately.

### Example
```yaml
tool_name: delete_task
parameters:
  dart_id: "tsk_abc123"
```

---

## add_task_comment — Add a Standalone Comment

**Required:**
- `dart_id` (string)
- `text` (string, markdown supported)

Use for comments that don't accompany an update. For combined update+comment, use `comment` parameter on `update_task`.

### Example
```yaml
tool_name: add_task_comment
parameters:
  dart_id: "tsk_abc123"
  text: "Verified fix in staging — ready for review"
```

---

## Common Mistakes

1. **Wrapping fields in `updates: {...}`** — `update_task` takes flat parameters directly
2. **Using `due_date` instead of `due_at`** — all date fields use `_at` suffix
3. **Expecting append behavior on relationship arrays** — direct assignment is full replacement; use `add_to`/`remove_from` for incremental updates
4. **Using task IDs from other systems** — dart-query uses `dart_id` format (e.g., `tsk_abc123`)

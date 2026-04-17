---
name: task-crud
description: dart-query task operations - create_task, get_task, update_task, delete_task, add_task_comment with relationship management and incremental updates. 任務創讀更刪：create/get/update/delete_task、注釋、關係管理、增量更新. Use when: create task, get task details, update task fields, delete task, add comment, manage task relationships, add blocker
---

# dart-query Task CRUD

Dart中任務之創建、讀取、更新、刪除。所有工具以dart_id為主鍵。

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
priority: string             # "Critical", "High", "Medium", "Low" — names from get_config
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
- `include_comments` (boolean, default false) — 包含注釋線程
- `include_relationships` (boolean, default true) — 包含關聯任務ID
- `expand_relationships` (boolean, default false) — 獲取關聯任務標題（額外API調用）

**各標誌適用場景：**
- `include_relationships: false` — 快速狀態查詢；最小負載
- `expand_relationships: true` — 向用戶展示任務上下文；顯示關聯任務標題

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

**CRITICAL: pass fields flat — NOT wrapped in `updates: {...}`** — 此為最常見錯誤。

可選字段同`create_task`，另加：

**Incremental relationship updates** (避免整體替換，僅新增/移除時使用)：
```yaml
add_to:
  blocker_ids: [dart_id, ...]    # appends; fetches current, merges, deduplicates automatically
remove_from:
  blocker_ids: [dart_id, ...]    # removes matching IDs
```

**規則：**
- 直接字段賦值採**完全替換語義**——送`[]`以清空
- 不可在**同一**關係上組合`add_to`/`remove_from`與直接字段賦值
- 可在不同關係上組合`add_to`與`remove_from`

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

軟刪除——可通過Dart Web UI恢復。任務立即從所有看板和查詢中移除。

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

不伴隨更新之獨立注釋時使用。組合更新+注釋時，用`update_task`上之`comment`參數。

### Example
```yaml
tool_name: add_task_comment
parameters:
  dart_id: "tsk_abc123"
  text: "Verified fix in staging — ready for review"
```

---

## Common Mistakes

1. **將字段包裝在`updates: {...}`中** — `update_task`直接取平鋪參數
2. **用`due_date`代替`due_at`** — 所有日期字段使用`_at`後綴
3. **期望關係數組追加行為** — 直接賦值為完全替換；增量更新用`add_to`/`remove_from`
4. **使用其他系統的任務ID** — dart-query使用`dart_id`格式（如`tsk_abc123`）

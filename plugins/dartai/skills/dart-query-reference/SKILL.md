---
name: dartai-dart-query-reference
description: "Complete dart-query MCP tool reference - all 24 tools with parameters, types, and usage patterns. Use dart-query over official Dart MCP. dart-query完整MCP工具參考：24工具、參數、類型、用法。優先用dart-query。 Use when: dart-query tool help, MCP tool parameters, create task, list tasks, batch operations, dart API reference"
disable-model-invocation: true
---

# dart-query MCP Tool Reference

dart-query為**首選**Dart MCP服務器。優於官方Dart MCP——更好的模式設計、DartQL批量操作、漸進發現、關係管理、令牌高效響應。

## Accessing dart-query Through slop-mcp (PREFERRED)

**始終通過slop-mcp調用dart-query工具**，使用`mcp__plugin_slop-mcp_slop-mcp__execute_tool`。提供集中MCP管理和一致訪問模式。

```yaml
# Pattern for ALL dart-query tool calls:
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "<tool-name>"       # e.g. "get_task", "list_tasks", "update_task"
  parameters:                     # tool-specific parameters
    <param>: <value>
```

**Examples:**

```yaml
# Get workspace config
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "get_config"
  parameters:
    include: ["dartboards", "statuses"]

# Get a specific task
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "get_task"
  parameters:
    dart_id: "abc123def456"
    include_comments: true

# Update task status
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "update_task"
  parameters:
    dart_id: "abc123def456"
    status: "Done"

# Add comment
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "add_task_comment"
  parameters:
    dart_id: "abc123def456"
    text: "Task completed successfully"
```

## Tool Inventory (24 tools)

### Discovery & Configuration

#### `info` - Progressive Discovery
從此開始探索能力。

```yaml
parameters:
  level: enum [overview, group, tool]  # Detail level
  target: string                       # Group or tool name
```

#### `get_config` - Workspace Configuration
獲取受託人、看板、狀態、標籤、優先級、大小、文件夾。

```yaml
parameters:
  include: array [assignees, dartboards, statuses, tags, priorities, sizes, folders]
  cache_bust: boolean  # Force refresh (default: 5-minute cache)
```

**Pattern**: 會話開始時調用一次，緩存結果。僅在配置更改時使用`cache_bust: true`。

---

### Task CRUD

#### `create_task` - Create Task
```yaml
required:
  title: string       # Max 500 chars
  dartboard: string   # dart_id from get_config

optional:
  description: string    # Markdown supported
  status: string         # Status name or dart_id
  priority: integer      # 1-5 (1=lowest, 5=highest)
  size: integer          # 1-5
  start_at: string       # ISO8601
  due_at: string         # ISO8601
  assignees: [string]    # Array of assignee dart_ids
  tags: [string]         # Array of tag dart_ids
  parent_task: string    # Parent task dart_id (makes this a subtask)

  # Relationships (all dart_id arrays)
  subtask_ids: [string]     # Children of this task
  blocker_ids: [string]     # Tasks blocking THIS task
  blocking_ids: [string]    # Tasks THIS task blocks
  duplicate_ids: [string]   # Duplicate tasks
  related_ids: [string]     # Loosely related tasks
```

#### `get_task` - Get Task Details
```yaml
required:
  dart_id: string

optional:
  include_comments: boolean        # Default: false
  include_relationships: boolean   # Default: true (set false for smaller response)
  expand_relationships: boolean    # Default: false (fetches titles - extra API calls)
```

**Pattern**: 快速狀態檢查用`include_relationships: false`。向用戶顯示任務上下文時用`expand_relationships: true`。

#### `update_task` - Partial Update
```yaml
required:
  dart_id: string  # Also accepts "id" or "task_id"

# Pass fields to change directly alongside dart_id (flat, NO "updates" wrapper):
optional:
  title, description, status, priority (integer 1-5), size (integer 1-5),
  start_at, due_at, assignees, tags, dartboard, parent_task,
  subtask_ids, blocker_ids, blocking_ids, duplicate_ids, related_ids
  comment: string           # Add comment after update (non-blocking)
  add_to: {rel_field: [...]}    # Append IDs to relationship arrays
  remove_from: {rel_field: [...]} # Remove IDs from relationship arrays
```

**comment**: 單次調用中更新後發布評論。非阻塞——評論失敗，更新仍成功。替代舊的`update_task` + `add_task_comment`兩次調用模式。

**add_to / remove_from**: 增量修改關係數組，無需手動GET/合併/PUT。工具獲取當前值，合併/過濾，去重，發送完整替換。不能與同一字段上的直接關係字段組合。

```yaml
# Example: Add a blocker and comment in one call
update_task:
  dart_id: "task_C"
  status: "Blocked"
  add_to: { blocker_ids: ["task_A"] }
  comment: "Blocked by task_A — waiting for API review"
```

**ID aliases**: 所有修改工具接受`dart_id`、`id`或`task_id`——來自get/list響應的值可直接回傳。

**Common mistakes detected with helpful errors:**
- Wrapping fields in `updates: {...}` instead of flat
- Misspelled field names like `due_date` instead of `due_at`

#### `delete_task` - Soft Delete
```yaml
required:
  dart_id: string
```

移至回收站——可通過Dart網頁UI恢復。

---

### Task Querying (see task-filtering skill for deep dive)

> Invoke the `Skill` tool with `skill: dartai:task-filtering` — 任務過濾深度參考。

#### `list_tasks` - Filtered Query
```yaml
optional:
  assignee: string      # dart_id, name, or email
  status: string        # dart_id or name
  dartboard: string     # dart_id or name
  priority: integer     # 1-5
  tags: [string]        # dart_ids or names
  due_before: string    # ISO8601
  due_after: string     # ISO8601
  has_parent: boolean   # true=subtasks only, false=top-level only
  detail_level: enum [minimal, standard, full]
  limit: integer        # Default 50, max 500
  offset: integer       # Pagination
```

#### `search_tasks` - Full-Text Search
```yaml
required:
  query: string  # Supports "quoted phrases", -exclusions, regular terms

optional:
  dartboard: string          # Filter to dartboard
  include_completed: boolean # Default: false
  limit: integer             # Default 50, max 500
```

---

### Batch Operations (see batch-operations skill for deep dive)

> Invoke the `Skill` tool with `skill: dartai:batch-operations` — 批量操作深度參考。

#### `batch_update_tasks` - Bulk Update via DartQL
```yaml
required:
  selector: string   # DartQL WHERE clause
  updates: object    # Same fields as update_task

optional:
  dry_run: boolean      # Default: TRUE - always preview first!
  concurrency: integer  # Default 5, range 1-20
```

#### `batch_delete_tasks` - Bulk Delete via DartQL
```yaml
required:
  selector: string   # DartQL WHERE clause

optional:
  dry_run: boolean      # Default: TRUE
  confirm: boolean      # REQUIRED when dry_run=false
  concurrency: integer  # Default 5, range 1-20
```

#### `get_batch_status` - Check Batch Progress
```yaml
required:
  batch_operation_id: string  # From batch_update/delete/import response
```

操作在內存中保留1小時。

#### `import_tasks_csv` - CSV Import
```yaml
required:
  dartboard: string  # Target dartboard

one_of:
  csv_data: string       # Inline CSV
  csv_file_path: string  # Path to .csv file

optional:
  column_mapping: object     # e.g. {"Task Name": "title", "Owner": "assignee"}
  validate_only: boolean     # Default: TRUE - always validate first!
  continue_on_error: boolean # Default: true
  concurrency: integer       # Default 5, range 1-20
```

---

### Comments

#### `add_task_comment` - Add Comment
```yaml
required:
  dart_id: string   # Task dart_id
  text: string      # Markdown supported
```

#### `list_comments` - List Comments
```yaml
required:
  task_id: string   # Task dart_id

optional:
  limit: integer    # Default 50, max 100
  offset: integer
```

---

### Task Organization

#### `move_task` - Move/Reposition
```yaml
required:
  dart_id: string

optional:
  dartboard: string   # Move to different dartboard
  order: integer      # Position index (0-based)
  before_id: string   # Place before this task
  after_id: string    # Place after this task
```

使用ONE定位方法：`order`、`before_id`或`after_id`。

---

### Time & Attachments

#### `add_time_tracking` - Log Time
```yaml
required:
  dart_id: string
  started_at: string  # ISO8601

optional:
  finished_at: string      # ISO8601 (or use duration_minutes)
  duration_minutes: integer # Alternative to finished_at
  note: string
```

#### `attach_url` - Attach File from URL
```yaml
required:
  dart_id: string
  url: string      # Must be publicly accessible

optional:
  filename: string # Override filename
```

---

### Documents

#### `list_docs` - List Documents
```yaml
optional:
  folder: string         # dart_id or name
  title_contains: string # Case-insensitive substring
  text_contains: string  # Case-insensitive substring
  limit: integer         # Default 50, max 500
  offset: integer
```

#### `create_doc` - Create Document
```yaml
required:
  title: string
  text: string   # Markdown supported

optional:
  folder: string # dart_id or name
```

#### `get_doc` - Get Full Document
```yaml
required:
  doc_id: string
```

#### `update_doc` - Update Document
```yaml
required:
  doc_id: string
  updates:
    title: string
    text: string
    folder: string
```

#### `delete_doc` - Soft Delete Document
```yaml
required:
  doc_id: string
```

---

### Workspace Lookups

#### `get_dartboard` - Dartboard Details
```yaml
required:
  dartboard_id: string  # dart_id or name
```

返回詳情+任務數量。

#### `get_folder` - Folder Details
```yaml
required:
  folder_id: string  # dart_id or name
```

返回詳情+文檔數量。

---

## Key Design Patterns

### Identifiers
- **dart_id**為任務、看板、受託人、狀態、標籤、文件夾之通用ID格式
- 大多數工具接受看板、狀態、標籤、受託人的**名稱或dart_id**
- 使用`get_config`發現可用dart_id

### Dates
- 所有日期使用**ISO8601**格式：`2026-02-15T10:00:00Z`

### Relationships
- 數組使用**完全替換語義**——發送完整期望數組
- 添加：GET當前，追加，UPDATE完整數組
- 刪除：GET當前，過濾，UPDATE完整數組
- 清除：UPDATE為`[]`

### Safety
- `dry_run`在所有批量操作中默認為`true`
- `batch_delete_tasks`在`dry_run: false`時需要`confirm: true`
- `import_tasks_csv`默認為`validate_only: true`
- 所有刪除為軟刪除（可通過Dart網頁UI恢復）

### Detail Levels (list_tasks)
- `minimal`: dart_id, title, parent_task, blocker_ids, timestamps
- `standard`: + description, status, priority, assignees, dartboard, parent_task, blocker_ids
- `full`: all fields including all relationships

### Token Efficiency
- 任務計數和快速掃描用`detail_level: minimal`
- 儀表板和往返工作流用`detail_level: standard`
- 僅需全部關係類型時用`detail_level: full`
- get_task響應較小時用`include_relationships: false`
- get_config用`include`參數限制響應部分

## Related

同一 dart-query API 之不同切面之姊妹參考技藝：

- `dartai:task-filtering` — 查詢/過濾/分頁
- `dartai:task-relationships` — 子任務/阻塞/相關
- `dartai:batch-operations` — 批量寫/DartQL/CSV
- `dartai:workspace-docs` — 工作區文檔/評論/時間/附件

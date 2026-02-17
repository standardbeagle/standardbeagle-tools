---
name: dart-query-reference
description: Complete dart-query MCP tool reference - all 24 tools with parameters, types, and usage patterns. Use dart-query over official Dart MCP.
---

# dart-query MCP Tool Reference

dart-query is the **preferred** Dart MCP server. Use it over the official Dart MCP - it has better schema design, DartQL batch operations, progressive discovery, relationship management, and token-efficient responses.

## Accessing dart-query Through slop-mcp (PREFERRED)

**Always call dart-query tools through slop-mcp** using `mcp__plugin_slop-mcp_slop-mcp__execute_tool`. This provides centralized MCP management and consistent access patterns.

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
Start here to explore capabilities.

```yaml
parameters:
  level: enum [overview, group, tool]  # Detail level
  target: string                       # Group or tool name
```

#### `get_config` - Workspace Configuration
Get assignees, dartboards, statuses, tags, priorities, sizes, folders.

```yaml
parameters:
  include: array [assignees, dartboards, statuses, tags, priorities, sizes, folders]
  cache_bust: boolean  # Force refresh (default: 5-minute cache)
```

**Pattern**: Call once at session start, cache results. Use `cache_bust: true` only when config changes.

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

**Pattern**: Use `include_relationships: false` for quick status checks. Use `expand_relationships: true` when displaying task context to user.

#### `update_task` - Partial Update
```yaml
required:
  dart_id: string  # NOT "task_id" or "id"

# Pass fields to change directly alongside dart_id (flat, NO "updates" wrapper):
optional:
  title, description, status, priority, size,
  start_at, due_at, assignees, tags, dartboard, parent_task,
  subtask_ids, blocker_ids, blocking_ids, duplicate_ids, related_ids
```

**CRITICAL**: All fields go at the top level alongside `dart_id` - do NOT nest inside an `updates` object. Relationship arrays use **full replacement semantics**. To add one blocker, you must GET current blockers, append, then UPDATE with the complete array. Setting `[]` clears all.

**Common mistakes detected with helpful errors:**
- `task_id` or `id` instead of `dart_id`
- Wrapping fields in `updates: {...}` instead of flat
- Misspelled field names like `due_date` instead of `due_at`

#### `delete_task` - Soft Delete
```yaml
required:
  dart_id: string
```

Moves to trash - recoverable via Dart web UI.

---

### Task Querying (see task-filtering skill for deep dive)

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

Operations kept in memory for 1 hour.

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

Use ONE positioning method: `order`, `before_id`, or `after_id`.

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

Returns details + task count.

#### `get_folder` - Folder Details
```yaml
required:
  folder_id: string  # dart_id or name
```

Returns details + doc count.

---

## Key Design Patterns

### Identifiers
- **dart_id** is the universal ID format for tasks, dartboards, assignees, statuses, tags, folders
- Most tools accept **name OR dart_id** for dartboards, statuses, tags, assignees
- Use `get_config` to discover available dart_ids

### Dates
- All dates use **ISO8601** format: `2026-02-15T10:00:00Z`

### Relationships
- Arrays use **full replacement semantics** - send the complete desired array
- To add: GET current, append, UPDATE with full array
- To remove: GET current, filter out, UPDATE with full array
- To clear: UPDATE with `[]`

### Safety
- `dry_run` defaults to `true` on all batch operations
- `batch_delete_tasks` requires `confirm: true` when `dry_run: false`
- `import_tasks_csv` defaults to `validate_only: true`
- All deletes are soft deletes (recoverable via Dart web UI)

### Token Efficiency
- Use `detail_level: minimal` for task counts and quick scans
- Use `detail_level: standard` for dashboards
- Use `detail_level: full` only when you need relationships
- Use `include_relationships: false` on get_task for smaller responses
- Use `include` parameter on get_config to limit response sections

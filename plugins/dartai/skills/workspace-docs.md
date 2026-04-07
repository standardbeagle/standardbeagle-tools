---
name: workspace-docs
description: dart-query workspace management - documents, config, dartboards, folders, comments, time tracking, attachments, task movement
---

# Workspace & Documents with dart-query

Beyond task CRUD and batch operations, dart-query provides tools for workspace configuration, documents, comments, time tracking, attachments, and task positioning.

> **Access Pattern**: Always call dart-query through slop-mcp:
> ```yaml
> tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
> params:
>   mcp_name: "dart-query"
>   tool_name: "<tool-name>"  # e.g. "get_config", "create_doc", "add_task_comment"
>   parameters: { ... }
> ```
> See the `dart-query-reference` skill for the full slop-mcp invocation pattern.

## Workspace Configuration

### get_config - Discover Your Workspace

```yaml
parameters:
  include: [assignees, dartboards, statuses, tags, priorities, sizes, folders]
  cache_bust: boolean  # Force refresh (5-minute cache default)
```

**Always call first** in a new session to discover available dart_ids.

```yaml
# Get everything
get_config: {}

# Get only what you need (saves tokens)
get_config:
  include: [dartboards, statuses]

# Force refresh after config change
get_config:
  cache_bust: true
  include: [assignees]
```

### What get_config Returns

```yaml
sections:
  assignees:
    # dart_id, name, email for each team member
    # Use for: assignee filters, task assignment

  dartboards:
    # dart_id, name for each dartboard
    # Use for: dartboard filters, task creation, move_task

  statuses:
    # dart_id, name, color for each status
    # Use for: status filters, task updates, batch selectors

  tags:
    # dart_id, name for each tag
    # Use for: tag filters, task tagging, batch operations

  priorities:
    # 1-5 mapping with labels
    # Use for: priority setting, filter validation

  sizes:
    # 1-5 mapping with labels
    # Use for: size estimation

  folders:
    # dart_id, name for each document folder
    # Use for: document organization, list_docs filter
```

### Config Caching Pattern

```yaml
session_start:
  # Call once, cache results
  config = get_config()

  # Extract frequently used IDs
  dartboard_ids = config.dartboards
  status_ids = config.statuses
  assignee_ids = config.assignees

during_session:
  # Use cached IDs for all operations
  # Most tools accept names too, but dart_ids are faster

when_to_refresh:
  - "New team member added"
  - "New dartboard created"
  - "Status workflow changed"
  - "New tags added"
```

---

### get_dartboard - Dartboard Details

```yaml
required:
  dartboard_id: string  # dart_id or name

returns:
  # Dartboard details + task count
  # Token-efficient single lookup
```

```yaml
# Check task count before bulk operations
get_dartboard:
  dartboard_id: "Sprint 5"
# Returns: { name, dart_id, task_count, ... }
```

### get_folder - Folder Details

```yaml
required:
  folder_id: string  # dart_id or name

returns:
  # Folder details + doc count
```

---

## Document Management

### list_docs - Find Documents

```yaml
optional:
  folder: string         # dart_id or name
  title_contains: string # Case-insensitive substring match
  text_contains: string  # Case-insensitive body search
  limit: integer         # Default 50, max 500
  offset: integer        # Pagination
```

```yaml
# All docs in a folder
list_docs:
  folder: "Project Docs"

# Search by title
list_docs:
  title_contains: "architecture"

# Search by content
list_docs:
  text_contains: "authentication flow"

# Combined filters
list_docs:
  folder: "Sprint 5"
  title_contains: "retrospective"
```

### create_doc - Create Document

```yaml
required:
  title: string
  text: string   # Markdown supported

optional:
  folder: string # dart_id or name
```

```yaml
# Sprint retrospective
create_doc:
  title: "Sprint 5 Retrospective"
  text: |
    ## What went well
    - Completed all P1 tasks
    - Good collaboration on auth feature

    ## What to improve
    - Need better estimation
    - Too many context switches

    ## Action items
    - [ ] Set WIP limits
    - [ ] Add estimation step to planning
  folder: "Retrospectives"

# Decision record
create_doc:
  title: "ADR-005: Use dart-query over official Dart MCP"
  text: |
    ## Context
    Need Dart integration for task management.

    ## Decision
    Use dart-query MCP server.

    ## Rationale
    - DartQL batch operations
    - Better schema design
    - Progressive discovery
    - Relationship management
  folder: "Architecture Decisions"
```

### get_doc - Get Full Document

```yaml
required:
  doc_id: string  # From list_docs results
```

### update_doc - Partial Update

```yaml
required:
  doc_id: string
  updates:
    title: string   # Optional
    text: string    # Optional - replaces full text
    folder: string  # Optional - move to different folder
```

```yaml
# Update document text
update_doc:
  doc_id: "doc_123"
  updates:
    text: |
      ## Updated content
      New information added...

# Move document to different folder
update_doc:
  doc_id: "doc_123"
  updates:
    folder: "Archive"
```

### delete_doc - Soft Delete

```yaml
required:
  doc_id: string
```

Moves to trash - recoverable via Dart web UI.

---

## Comments

### add_task_comment - Add Comment

```yaml
required:
  dart_id: string   # Task dart_id
  text: string      # Markdown supported
```

```yaml
# Status update
add_task_comment:
  dart_id: "task_123"
  text: |
    ## Progress Update
    - Completed API endpoint implementation
    - Tests passing (12/12)
    - Waiting on design review for UI component

# AI execution log
add_task_comment:
  dart_id: "task_123"
  text: |
    ## Automated Execution Log
    **Agent**: task-executor
    **Phase**: Implementation Complete
    **Files Changed**: `src/auth.ts`, `src/auth.test.ts`
    **Tests**: 15 passed, 0 failed
    **Coverage**: 92% (up from 85%)

# Blocker notification
add_task_comment:
  dart_id: "task_123"
  text: |
    ## BLOCKED
    **Reason**: Dependency `task_456` not yet complete
    **Impact**: Cannot proceed with database migration
    **Action**: Re-assigned `task_456` to priority 5
```

### list_comments - List Comments

```yaml
required:
  task_id: string   # Task dart_id

optional:
  limit: integer    # Default 50, max 100
  offset: integer   # Pagination
```

```yaml
# Get recent comments
list_comments:
  task_id: "task_123"
  limit: 10

# Page through older comments
list_comments:
  task_id: "task_123"
  limit: 50
  offset: 50
```

---

## Time Tracking

### add_time_tracking - Log Time

```yaml
required:
  dart_id: string
  started_at: string  # ISO8601

optional:
  finished_at: string      # ISO8601 (provide this OR duration_minutes)
  duration_minutes: integer # Alternative to finished_at
  note: string             # What was worked on
```

```yaml
# Log with start/end times
add_time_tracking:
  dart_id: "task_123"
  started_at: "2026-02-15T09:00:00Z"
  finished_at: "2026-02-15T11:30:00Z"
  note: "Implemented login endpoint and tests"

# Log with duration
add_time_tracking:
  dart_id: "task_123"
  started_at: "2026-02-15T14:00:00Z"
  duration_minutes: 45
  note: "Code review and fixes"

# Log AI execution time
add_time_tracking:
  dart_id: "task_123"
  started_at: "2026-02-15T10:00:00Z"
  duration_minutes: 12
  note: "Automated execution via dartai task-executor"
```

---

## Attachments

### attach_url - Attach File from URL

```yaml
required:
  dart_id: string
  url: string      # Must be publicly accessible

optional:
  filename: string # Override auto-detected filename
```

```yaml
# Attach a screenshot
attach_url:
  dart_id: "task_123"
  url: "https://example.com/screenshots/bug-report.png"
  filename: "login-error-screenshot.png"

# Attach a design document
attach_url:
  dart_id: "task_123"
  url: "https://figma.com/export/design-v2.pdf"

# Attach build artifact
attach_url:
  dart_id: "task_123"
  url: "https://ci.example.com/builds/123/coverage-report.html"
  filename: "coverage-report.html"
```

---

## Task Movement

### move_task - Reposition Tasks

```yaml
required:
  dart_id: string

optional:
  dartboard: string   # Move to different dartboard
  order: integer      # Position index (0-based)
  before_id: string   # Place before this task
  after_id: string    # Place after this task
```

Use exactly ONE positioning method.

```yaml
# Move to different dartboard
move_task:
  dart_id: "task_123"
  dartboard: "Sprint 6"

# Move to top of dartboard
move_task:
  dart_id: "task_123"
  order: 0

# Move after a specific task
move_task:
  dart_id: "task_123"
  after_id: "task_456"

# Move before a specific task
move_task:
  dart_id: "task_123"
  before_id: "task_789"

# Move to different dartboard AND position
move_task:
  dart_id: "task_123"
  dartboard: "Sprint 6"
  order: 0  # Top of new dartboard
```

### Movement Patterns

```yaml
# Prioritize: move task to top
move_task:
  dart_id: "urgent_task"
  order: 0

# Sprint grooming: reorder by priority
# Get tasks sorted by priority, then reposition
list_tasks:
  dartboard: "Sprint 5"
  detail_level: standard
# Sort client-side by priority
# Move each task to correct position

# Cross-dartboard migration
# Move single task to different board
move_task:
  dart_id: "task_123"
  dartboard: "Done Board"

# For bulk moves, use batch_update_tasks instead:
batch_update_tasks:
  selector: "dartboard = 'Sprint 4' AND status = 'Done'"
  updates:
    dartboard: "Archive"
  dry_run: true
```

---

## Workflow Recipes

### Session Initialization
```yaml
# Start of every dartai session
step_1: get_config(include: [dartboards, statuses, assignees, tags])
step_2: get_dartboard(dartboard_id: "current sprint")  # Check task count
step_3: list_tasks(dartboard: "current sprint", status: "In Progress", detail_level: standard)
```

### Task Completion Flow
```yaml
step_1: update_task(dart_id: task_id, status: "Done", comment: completion_summary)
step_2: add_time_tracking(dart_id: task_id, started_at: start, duration_minutes: elapsed)
step_3: # Optional: attach_url for build artifacts
```

### Document Decision Records
```yaml
# When a technical decision is made during task execution
create_doc:
  title: "Decision: {topic}"
  text: "Context, decision, rationale"
  folder: "Decisions"

# Link to task via comment
add_task_comment:
  dart_id: task_id
  text: "Decision recorded in doc: {doc_title}"
```

### Sprint Report Generation
```yaml
# Gather data
done_tasks = list_tasks(dartboard: "Sprint 5", status: "Done", detail_level: standard)
in_progress = list_tasks(dartboard: "Sprint 5", status: "In Progress", detail_level: standard)
todo = list_tasks(dartboard: "Sprint 5", status: "Todo", detail_level: standard)
board = get_dartboard(dartboard_id: "Sprint 5")

# Create report document
create_doc:
  title: "Sprint 5 Report"
  text: |
    ## Sprint 5 Summary
    Total tasks: ${board.task_count}
    Completed: ${done_tasks.count}
    In Progress: ${in_progress.count}
    Remaining: ${todo.count}

    ## Completed Work
    ${done_tasks formatted}

    ## Carry-over
    ${in_progress + todo formatted}
  folder: "Sprint Reports"
```

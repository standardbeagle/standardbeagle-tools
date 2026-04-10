---
name: task-lifecycle
description: Guide the full task lifecycle from creation through completion - assignment, progress tracking, relationships, comments, and time logging with dart-query
---

# dart-query Task Lifecycle

This skill walks through the complete task lifecycle using dart-query tools. Each phase is a concrete recipe with tool calls. For tool parameter details, see the `task-crud` and `querying` skills.

## Access Pattern (all examples below use this)

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "<tool-name>"
  parameters: { ... }
```

---

## Phase 1: Creation

### Basic task creation

```yaml
tool_name: create_task
parameters:
  title: "Add OAuth login flow"
  dartboard: "Sprint 42"
  priority: 2
  assignees: ["usr_abc123"]
  comment: "Scope: Google + GitHub providers, token refresh included"
```

### Epic with subtasks

Create the parent first, then each child with `parent_task`:

```yaml
# Step 1 — create the epic
tool_name: create_task
parameters:
  title: "User Authentication Epic"
  dartboard: "Backlog"
  priority: 2
  size: 5

# Step 2 — create subtasks (repeat for each child)
tool_name: create_task
parameters:
  title: "OAuth provider integration"
  dartboard: "Sprint 42"
  parent_task: "tsk_epic001"
  priority: 2
```

### Set initial relationships at creation time

Use `blocker_ids` / `related_ids` in `create_task` to wire up dependencies immediately — avoids a follow-up `update_task` call.

```yaml
tool_name: create_task
parameters:
  title: "Deploy auth service"
  dartboard: "Sprint 42"
  blocker_ids: ["tsk_oauth001", "tsk_db002"]
  comment: "Cannot start until OAuth and DB migrations are done"
```

---

## Phase 2: Assignment

### Assign (or reassign) a task

```yaml
tool_name: update_task
parameters:
  dart_id: "tsk_abc123"
  assignees: ["usr_new456"]
  comment: "Reassigned to @alice — she owns auth this sprint"
```

### Workload check before assigning

List the target assignee's current in-progress tasks to avoid overloading them:

```yaml
tool_name: list_tasks
parameters:
  assignee: "usr_new456"
  status: "In Progress"
  limit: 20
```

If the list is long, consider distributing the work. Then proceed with assignment above.

---

## Phase 3: Progress Tracking

### Status transitions

Move a task through the standard workflow:

```yaml
# Pick up work
tool_name: update_task
parameters:
  dart_id: "tsk_abc123"
  status: "In Progress"
  comment: "Starting implementation — targeting Thursday"

# Submit for review
tool_name: update_task
parameters:
  dart_id: "tsk_abc123"
  status: "In Review"
  comment: "PR #218 open — link: https://github.com/org/repo/pull/218"
```

### Progress comment (markdown status update)

Use `add_task_comment` for standalone updates that don't change task fields:

```yaml
tool_name: add_task_comment
parameters:
  dart_id: "tsk_abc123"
  text: |
    **Progress update**
    - [x] Token generation
    - [x] Refresh logic
    - [ ] E2E tests
    ETA: Friday EOD
```

### Blocker management

**Add a blocker** — use `add_to` to avoid replacing existing blockers:

```yaml
tool_name: update_task
parameters:
  dart_id: "tsk_abc123"
  status: "Blocked"
  comment: "Blocked on API contract review by platform team"
  add_to:
    blocker_ids: ["tsk_platform099"]
```

**Resolve a blocker** — remove it and restore status:

```yaml
tool_name: update_task
parameters:
  dart_id: "tsk_abc123"
  status: "In Progress"
  comment: "Unblocked — API contract approved. Resuming."
  remove_from:
    blocker_ids: ["tsk_platform099"]
```

### Link related tasks discovered during work

```yaml
tool_name: update_task
parameters:
  dart_id: "tsk_abc123"
  add_to:
    related_ids: ["tsk_logging007"]
  comment: "Related to session logging work — coordinate on shared token schema"
```

---

## Phase 4: Completion

### Mark done with summary comment

```yaml
tool_name: update_task
parameters:
  dart_id: "tsk_abc123"
  status: "Done"
  comment: |
    **Completed**
    Delivered OAuth login with Google + GitHub. Token refresh working.
    PR #218 merged. Docs updated in Notion.
```

### Log time spent

```yaml
tool_name: add_time_tracking
parameters:
  dart_id: "tsk_abc123"
  started_at: "2026-04-10T09:00:00Z"
  duration_minutes: 240
  note: "Implementation and PR review"
```

### Attach artifacts

```yaml
tool_name: attach_url
parameters:
  dart_id: "tsk_abc123"
  url: "https://ci.example.com/builds/4421/report"
  filename: "ci-build-report.html"
```

### Clear stale relationships

When a task is done, remove any remaining blocker/blocking links that are no longer relevant:

```yaml
tool_name: update_task
parameters:
  dart_id: "tsk_abc123"
  blocker_ids: []
  blocking_ids: []
```

---

## Phase 5: Post-Completion

### Unblock dependent tasks

Find tasks that listed this task as a blocker, then remove it from each:

```yaml
# Find dependent tasks — list_tasks doesn't support blocker_ids filter,
# so fetch with detail_level: full and filter client-side for tasks
# where blocker_ids contains "tsk_abc123"
tool_name: list_tasks
parameters:
  dartboard: "Sprint 42"
  detail_level: "full"

# For each result where blocker_ids includes tsk_abc123, remove it
tool_name: update_task
parameters:
  dart_id: "tsk_dependent001"
  status: "In Progress"
  comment: "Unblocked — tsk_abc123 is now done"
  remove_from:
    blocker_ids: ["tsk_abc123"]
```

### Move to archive dartboard (end of sprint)

```yaml
tool_name: update_task
parameters:
  dart_id: "tsk_abc123"
  dartboard: "Archive Q2-2026"
```

### Create follow-up tasks

If work revealed scope for a future sprint, capture it immediately. See `task-crud` for full `create_task` options.

```yaml
tool_name: create_task
parameters:
  title: "Add Apple OAuth provider"
  dartboard: "Backlog"
  priority: 3
  related_ids: ["tsk_abc123"]
  comment: "Follow-up from OAuth epic — low priority for Q3"
```

---

## Quick Reference: Lifecycle Cheatsheet

| Phase | Key Tools | Key Fields |
|---|---|---|
| **Creation** | `create_task` | `title`, `dartboard`, `parent_task`, `blocker_ids`, `comment` |
| **Assignment** | `list_tasks`, `update_task` | `assignee`, `status` (workload check) |
| **In Progress** | `update_task`, `add_task_comment` | `status`, `add_to.blocker_ids`, `remove_from.blocker_ids` |
| **Completion** | `update_task`, `add_time_tracking`, `attach_url` | `status: "Done"`, `started_at`, `duration_minutes`, `url` |
| **Post-completion** | `list_tasks` (full detail), `update_task` | client-side blocker filter, `dartboard` (archive), `create_task` (follow-ups) |

For bulk operations across many tasks, see the `batch-ops` skill. For filtering and search patterns, see the `querying` skill.

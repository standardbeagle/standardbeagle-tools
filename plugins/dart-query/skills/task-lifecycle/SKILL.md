---
name: dart-query-task-lifecycle
description: "Guide the full task lifecycle from creation through completion - assignment, progress tracking, relationships, comments, and time logging with dart-query. 從創建至完成之完整任務生命周期：分配、進度追蹤、關係、注釋、時間記錄. Use when: create and assign task, track task progress, manage blockers, complete a task, log time, post-completion follow-up"
disable-model-invocation: true
---

# dart-query Task Lifecycle

本技能以dart-query工具貫穿完整任務生命周期，各階段附具體配方與工具調用。工具參數詳情見：

> Invoke the `Skill` tool with `skill: dart-query:task-crud` — 任務創讀更刪完整參數。

> Invoke the `Skill` tool with `skill: dart-query:querying` — 過濾與搜索模式。

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

先創建父任務，再以`parent_task`創建各子任務：

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

創建時用`blocker_ids`/`related_ids`立即連線依賴——避免後續`update_task`調用。

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

分配前列出目標受派者當前進行中任務，避免超負荷：

```yaml
tool_name: list_tasks
parameters:
  assignee: "usr_new456"
  status: "In Progress"
  limit: 20
```

列表過長則考慮分散工作，再執行上方分配操作。

---

## Phase 3: Progress Tracking

### Status transitions

任務流轉標準工作流：

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

不變更任務字段之獨立更新用`add_task_comment`：

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

**新增阻礙** — 用`add_to`避免替換現有阻礙：

```yaml
tool_name: update_task
parameters:
  dart_id: "tsk_abc123"
  status: "Blocked"
  comment: "Blocked on API contract review by platform team"
  add_to:
    blocker_ids: ["tsk_platform099"]
```

**解除阻礙** — 移除並恢復狀態：

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

任務完成後移除不再相關之阻礙/被阻礙鏈接：

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

查找以本任務為阻礙者，逐一移除：

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

工作揭示未來迭代範圍時，立即捕獲。完整`create_task`選項見：

> Invoke the `Skill` tool with `skill: dart-query:task-crud` — 創建選項完整參考。

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

多任務批量操作：

> Invoke the `Skill` tool with `skill: dart-query:batch-ops` — 批量操作完整參考。

過濾與搜索模式：

> Invoke the `Skill` tool with `skill: dart-query:querying` — 查詢過濾完整參考。

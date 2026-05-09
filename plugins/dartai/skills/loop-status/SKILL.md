---
name: dartai-loop-status
description: "\"Show current Ralph Wiggum loop status and task progress. 顯示當前Ralph Wiggum循環狀態及任務進度。 Use when: check loop status, view task queue, loop progress, is loop running, current task\""
---

# Loop Status

顯示Ralph Wiggum執行循環當前狀態。

## Process

### 1. Check Loop State

從會話查詢當前循環狀態：
- 循環是否運行中？
- 當前看板
- 隊列中任務
- 當前執行任務

**Read local state first, fetch Dart at minimal detail.** Loop status is primarily a read of `.dartai/loop-state.json` (local file, no API cost). Only when the user requests a live queue view should `list_tasks` be called, and even then `detail_level: "minimal"` is sufficient — the queue display only needs id, title, and status.

```yaml
# Live queue view (only when local state is stale or user requests refresh)
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "list_tasks"
  parameters:
    dartboard: "[dartboard from loop-state.json]"
    tag: "loop-task"
    detail_level: "minimal"
    limit: 50
```

For the parent loop task itself (single fetch, used by §2 display), use `get_task` with relationships disabled — the loop task description is the only field needed:

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "get_task"
  parameters:
    dart_id: "[loop_task_id from loop-state.json]"
    include_relationships: false
    include_comments: false
```

### 2. Display Status

If loop is running:
```
Ralph Wiggum Loop: ACTIVE
=========================
Dartboard: [name]
Runner: [runner_instance_id] ([runner_email])
Started: [timestamp] ([duration] ago)

Progress: [completed] / [total] tasks
Current Task: [title]
  Status: [pipeline step]

Completed Tasks:
1. [task1] - SUCCESS
2. [task2] - SUCCESS

Queue:
1. [task3] - PENDING
2. [task4] - PENDING

Controls:
- Say "stop" to end loop
- Say "skip" to skip current task
- Say "pause" to pause for review
```

If loop is not running:
```
Ralph Wiggum Loop: INACTIVE
===========================
No active execution loop.

To start: /dartai:start [dartboard-name]
To run single task: /dartai:task <task-id>
```

### 3. Task Details

用戶請求特定任務詳情時 — this is the **only** point in `/dartai:loop-status` that fetches full description, because the user explicitly asked to drill in:
```
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "get_task"
  parameters:
    dart_id: "<task_dart_id>"
    include_comments: true
    include_relationships: true   # show blockers/blocking on detail view
```

The §1/§2 status overview never makes this call — it operates on minimal-detail summaries.

## Usage

```
/dartai:loop-status
```

## Related Commands

- `/dartai:start` - Start the loop
- `/dartai:task` - Execute single task
- `/dartai:sync` - Sync changes to Dart

---
name: sync
description: "Synchronize local work with Dart task statuses and comments. 同步本地工作與Dart任務狀態及評論。 Use when: sync dart tasks, update task status, commit progress to dart, post completion comments, sync changes"
argument-hint: "[--force]"
context: fork
agent: general-purpose
---

# Sync with Dart

同步本地工作進度至Dart，更新任務狀態並添加完成評論。

## Process

### 1. Gather Local Changes

掃描當前會話完成的工作：
- 會話開始以來的git提交
- 已修改文件
- 測試結果
- 文檔更改

### 2. Match to Tasks

每個更改嘗試匹配Dart任務：
- 在提交信息中尋找任務ID
- 將文件更改與任務描述匹配
- 檢查引用任務的TODO評論

**Fetch candidate tasks at minimal detail.** Sync only needs `id`, `title`, `status` to match commit messages and propose updates. Full descriptions are not required for matching:

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "list_tasks"
  parameters:
    dartboard: "[current-dartboard]"
    detail_level: "minimal"
    limit: 100
```

**DartQL filter at source — don't fetch-then-filter.** When sync needs the active working set (tasks plausibly affected by this session), filter at the API rather than scanning a full list in driver context:

```yaml
# Tasks currently In Progress on this dartboard (DartQL via batch_update dry_run)
batch_update_tasks(
  selector: "dartboard = '[dartboard]' AND status IN ('In Progress', 'Doing')",
  updates: {},
  dry_run: true,
)
```

```yaml
# Or list_tasks with status filter when one status is enough
list_tasks(
  dartboard: "[dartboard]",
  status: "In Progress",
  detail_level: "standard",   # need title + status for the proposal table
  limit: 50,
)
```

Upgrade to `detail_level: "standard"` only for the subset that will appear in the §3 proposal table.

### 3. Preview Updates

顯示擬議的Dart更新：
```
Proposed Dart Updates
=====================

Task: [title] (ID: [id])
  Current Status: In Progress
  Proposed Status: Done
  Comment: "Completed implementation of [feature]..."

Task: [title] (ID: [id])
  Current Status: To-do
  Proposed Status: In Progress
  Comment: "Started work on [description]..."

Apply these updates? (yes/no)
```

### 4. Apply Updates

If confirmed (or --force flag), and the proposal contains **multiple tasks getting the same status flip** (e.g. several tasks all moving To-do → Doing for a sprint kickoff), prefer `batch_update_tasks` with a DartQL selector over N sequential `update_task` calls:

```yaml
# Batch flip for N tasks with the same target status
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "batch_update_tasks"
  parameters:
    selector: "id IN ('id1', 'id2', 'id3')"
    updates: {status: "Done"}
    dry_run: false
```

For single-task updates or per-task comments (where each task gets a different completion note), keep the per-task call:

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "update_task"
  parameters:
    dart_id: "[task-id]"
    status: "[new-status]"
    comment: "[completion note]"
```

Rule of thumb: 3+ tasks with the same status change → `batch_update_tasks`. Mixed updates or per-task comments → `update_task` loop.

### 5. Report Results

```
Sync Complete
=============
Updated: 3 tasks
Added: 5 comments
Errors: 0

Details:
- [task1]: Status updated to Done
- [task2]: Added completion comment
- [task3]: Status updated to In Progress
```

## Usage

```
/dartai:sync           # Interactive sync with confirmation
/dartai:sync --force   # Apply all updates without confirmation
```

## Notes

- 同步不創建新任務，只更新現有任務
- 在提交信息中使用任務ID以獲得更好的匹配：`[DART-xyz123] Fix bug`
- 同步不更改標記為"Blocked"或"Cancelled"的任務

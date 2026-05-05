---
name: sync
description: "Synchronize local work with Dart task statuses and comments. 同步本地工作與Dart任務狀態及評論。 Use when: sync dart tasks, update task status, commit progress to dart, post completion comments, sync changes"
argument-hint: "[--force]"
context: fork
agent: general-purpose
---

# Sync with Dart

同步本地進度到 Dart。

## Process

### 1. Gather Local Changes

掃描：
- 本會話 git 提交
- 已改文件
- 測試結果
- 文檔變更

### 2. Match to Tasks

每個改動配任務：
- 提交訊息找 task id
- 文件改動對任務描述
- 查 TODO 評論

**抓候選任務用 minimal detail.** Sync 只要 `id/title/status`.

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

**DartQL 先過濾，不要先抓再濾.**

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

只給 §3 會出表的 subset 升 `standard`.

### 3. Preview Updates

預覽更新：
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

若確認或 `--force`，且 N≥3 task 同改狀態，用 `execute_dartql` 多語句 UPDATE，附 `COMMENT` 子句留審計痕。Loop driver 先以提交訊息抽 task id 列表，將 `<commit_sha>` 直接代入字串再構 query。

**Step A — 預覽 (dry_run: true)**：先空跑驗 selector 命中正確 task 集，再執行。

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "execute_dartql"
  parameters:
    query: "UPDATE WHERE dart_id IN ('id1','id2','id3') SET status='Done' COMMENT 'Synced from <commit_sha>'"
    dry_run: true
```

**Step B — 執行 (dry_run: false)**：預覽通過後，同 query 改 `dry_run: false` 提交。

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "execute_dartql"
  parameters:
    query: "UPDATE WHERE dart_id IN ('id1','id2','id3') SET status='Done' COMMENT 'Synced from <commit_sha>'"
    dry_run: false
```

單 task、N≤2、或每 task comment 不同，跳過 DartQL 開銷，逐個 `update_task`.

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

規則：N≥3 同改且 comment 統一 → `execute_dartql` UPDATE 兩步制。N≤2 或混合 comment → 逐 `update_task`.

### 5. Report Results

```
Sync done
=========
Updated: 3 tasks
Added: 5 comments
Errors: 0
```

## Usage

```
/dartai:sync           # Interactive sync with confirmation
/dartai:sync --force   # Apply all updates without confirmation
```

## Notes

- 同步不創建新任務，只更新現有任務
- 提交信息用 task id 更好配：`[DART-xyz123] Fix bug`
- 不改 `Blocked` / `Cancelled`

---
name: task
description: "Execute a single task through the quality pipeline. 通過品質管道執行單個任務。 Use when: run single task, execute dart task by id, task pipeline, implement one task, quality pipeline single task"
argument-hint: "<task-id or title>"
context: fork
agent: dartai:task-executor
---

# Execute Single Task

在不啟動持續循環的情況下，對單個Dart任務運行完整品質管道。

## Process

### 1. Find the Task

If argument looks like a Dart task ID (12 alphanumeric chars):
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "get_task"
  parameters:
    dart_id: "[argument]"
```

Otherwise, search by title:
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "search_tasks"
  parameters:
    query: "[argument]"
```

### 2. Confirm Task

Display task details and confirm:
- Title
- Description
- Current status
- Dartboard
- Assignee

### 2.5. Grill Task Spec

移交task-executor代理前，以任務原始描述調用`dev-standards:grill-task`。技能探測項目上下文，運行層級門控審訊，執行規劃時品質審查（直接性、問題/方案適配、可測試性、過度工程防護、方案深度），並返回已審查任務規格。

- 以`task_spec`代替原始描述傳遞給task-executor代理。
- grill返回的所有`backflow_writes`在執行開始前提交至項目。
- 若grill返回`verdict: TOO_LARGE_TO_GRILL`，更新Dart任務狀態為`Blocked`並添加建議拆分的評論，停止——不派發task-executor。

勿在此預分類層級。讓grill-task自身的層級分類決定。最小層級任務不變地通過grill-task，因此將所有任務路由通過它無額外成本。

### 3. Execute Pipeline

Use the task-executor agent to run the full quality pipeline.

**Task tool invocation:**
```yaml
Task tool call:
  subagent_type: "dartai:task-executor"
  max_turns: 50  # Timeout - ensures agent returns even if stuck
  description: "Execute task: [task-title]"
  prompt: |
    Execute task [TASK_ID] through the quality pipeline.
    ...task details...
```

**Pipeline phases:**

1. **Understand task**: Read task description, identify scope
2. **Implement changes**: Make necessary code changes
3. **Code review**: Self-review with LCI search
4. **Run linting**: Execute project's linter
5. **Run tests**: Execute test suite
6. **LCI evaluation**: Check code quality patterns
7. **Refactor check**: Ensure changes are clean
8. **Deprecated cleanup**: Remove obsolete code

### 4. Update Task Status

On success:
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "update_task"
  parameters:
    dart_id: "[task-id]"
    status: "Done"
    comment: "[completion summary]"
```

On failure:
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "update_task"
  parameters:
    dart_id: "[task-id]"
    status: "Blocked"
    comment: "[failure details]"
```

### 5. Update Documentation

使用doc-updater代理更新文檔：

```yaml
Task tool call:
  subagent_type: "dartai:doc-updater"
  max_turns: 20  # Doc updates are simpler, shorter timeout
  description: "Update docs for: [task-title]"
  prompt: |
    Update documentation for completed task [TASK_ID]...
```

Actions:
- Add entry to CHANGELOG if feature/fix
- Update README if applicable
- Add Dart task comment with summary

## Usage Examples

```
/dartai:task QiXCNniu7OQY
/dartai:task "Color MCP Server"
/dartai:task "Fix login bug"
```

## Output

Task execution report:
```
Task Execution Report
=====================
Task: [title]
Status: SUCCESS / FAILED

Pipeline Results:
- Code Review: PASS
- Linting: PASS (0 errors)
- Tests: PASS (42 passed, 0 failed)
- LCI Check: PASS
- Refactor: PASS
- Cleanup: PASS (removed 3 deprecated functions)

Changes Made:
- [file1]: [description]
- [file2]: [description]

Documentation Updated:
- CHANGELOG.md: Added entry for [feature]
- Dart comment: Added completion summary
```

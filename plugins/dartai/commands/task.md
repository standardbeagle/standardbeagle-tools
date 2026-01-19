---
name: task
description: Execute a single task through the quality pipeline
argument-hint: "<task-id or title>"
---

# Execute Single Task

Run the full quality pipeline on a single Dart task without starting the continuous loop.

## Process

### 1. Find the Task

If argument looks like a Dart task ID (12 alphanumeric chars):
```
Use mcp__dart-query__get_task with id: [argument]
```

Otherwise, search by title:
```
Use mcp__dart-query__list_tasks with title: [argument]
```

### 2. Confirm Task

Display task details and confirm:
- Title
- Description
- Current status
- Dartboard
- Assignee

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
```
Use mcp__dart-query__update_task to set status: "Done"
Use mcp__dart-query__add_task_comment with completion summary
```

On failure:
```
Use mcp__dart-query__update_task to set status: "Blocked" or keep "In Progress"
Use mcp__dart-query__add_task_comment with failure details
```

### 5. Update Documentation

Use doc-updater agent to update documentation:

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

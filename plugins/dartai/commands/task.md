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

Before handing off to the task-executor agent, invoke `dev-standards:grill-task` with the task's raw description. The skill probes project context, runs tier-gated interrogation, and returns a grilled task spec.

- Pass the `task_spec` to the task-executor agent in place of the raw description.
- Any `backflow_writes` from the grill are committed to the project before execution starts.
- If grill returns `verdict: TOO_LARGE_TO_GRILL`, update the Dart task status to `Blocked` with a comment recommending the split, and STOP — do not dispatch the task-executor.

Do NOT pre-classify tier here. Let grill-task's own tier classification decide. Minimal-tier tasks pass through grill-task unchanged, so there is no cost to routing everything through it.

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

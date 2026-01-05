---
name: start
description: Start the Ralph Wiggum continuous task execution loop on a dartboard
argument-hint: "[dartboard-name]"
---

# Start Ralph Wiggum Loop

Start the continuous task execution loop that processes tasks from a Dart dartboard.

## Process

### 1. Determine Target Dartboard

If dartboard name provided as argument, use it. Otherwise:

1. Check for `.claude/dartai.local.md` config file for default dartboard
2. Try to match current directory name to a dartboard
3. Ask user to select from available dartboards via Dart MCP

```
Use mcp__Dart__get_config to get available dartboards
```

### 2. Fetch Active Tasks

Query Dart for tasks in the dartboard:

```
Use mcp__Dart__list_tasks with:
- dartboard: [selected dartboard]
- is_completed: false
- status: "To-do" or "In Progress"
- limit: 20
```

### 3. Initialize Loop State

Track:
- Current dartboard
- Tasks queue (ordered by priority)
- Completed tasks count
- Failed tasks count
- Start time

### 4. Execute Loop

For each task in queue:

1. **Announce task**: Display task title and description
2. **Update status**: Set task to "In Progress" via Dart MCP
3. **Execute pipeline**: Use task-executor agent
4. **Handle result**:
   - Success: Update to "Done", add completion comment, continue
   - Failure: Update status, add failure details, STOP loop
5. **Update documentation**: Use doc-updater agent
6. **Check for stop signal**: User can say "stop" to end loop

### 5. Loop Control

The loop continues until:
- All tasks completed
- A task fails (stops with report)
- User says "stop", "cancel", or "pause"
- Session ends

### 6. Status Reporting

Display ongoing progress:
```
Ralph Wiggum Loop Status
========================
Dartboard: [name]
Progress: [X] of [Y] tasks
Current: [task title]
Completed: [list]
Time elapsed: [duration]
```

## Usage Examples

```
/dartai:start
/dartai:start Personal/standardbeagle-tools
/dartai:start "My Project Tasks"
```

## Stopping the Loop

Say any of:
- "stop the loop"
- "cancel ralph wiggum"
- "pause execution"
- "/dartai:stop"

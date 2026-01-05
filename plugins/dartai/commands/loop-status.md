---
name: loop-status
description: Show current Ralph Wiggum loop status and task progress
---

# Loop Status

Display the current status of the Ralph Wiggum execution loop.

## Process

### 1. Check Loop State

Query the current loop state from session:
- Is loop running?
- Current dartboard
- Tasks in queue
- Current task being executed

### 2. Display Status

If loop is running:
```
Ralph Wiggum Loop: ACTIVE
=========================
Dartboard: [name]
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

If user asks for more details on a specific task:
```
Use mcp__Dart__get_task to fetch full task info
```

## Usage

```
/dartai:loop-status
```

## Related Commands

- `/dartai:start` - Start the loop
- `/dartai:task` - Execute single task
- `/dartai:sync` - Sync changes to Dart

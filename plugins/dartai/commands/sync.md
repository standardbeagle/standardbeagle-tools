---
name: sync
description: Synchronize local work with Dart task statuses and comments
argument-hint: "[--force]"
---

# Sync with Dart

Synchronize local work progress with Dart, updating task statuses and adding completion comments.

## Process

### 1. Gather Local Changes

Scan for work done in current session:
- Git commits since session start
- Modified files
- Test results
- Documentation changes

### 2. Match to Tasks

For each change, try to match to a Dart task:
- Look for task IDs in commit messages
- Match file changes to task descriptions
- Check TODO comments referencing tasks

### 3. Preview Updates

Show proposed Dart updates:
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

If confirmed (or --force flag):
```
Use mcp__dart-query__update_task for each status change
Use mcp__dart-query__add_task_comment for each completion note
```

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

- Sync does not create new tasks, only updates existing ones
- Use commit messages with task IDs for better matching: `[DART-xyz123] Fix bug`
- Sync will not change tasks marked as "Blocked" or "Cancelled"

---
name: dart-task-workflow
description: Common Dart task workflows - fetching, updating, and completing tasks through SLOP
---

# Dart Task Workflows

Step-by-step workflows for common Dart task operations using SLOP.

## Prerequisites

- SLOP server running with Dart MCP configured
- Valid Dart workspace credentials

## Workflow 1: Get Active Tasks for a Dartboard

Fetch incomplete tasks from a specific project.

### Step 1: Get Tasks

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart-query"
  tool_name: "list_tasks"
  parameters: {
    "dartboard": "YOUR_DARTBOARD_NAME",
    "is_completed": false,
    "limit": 20,
    "o": ["order"]
  }
```

### Step 2: Filter by Status (Optional)

Add status filter for specific workflow stages:

```
parameters: {
  "dartboard": "YOUR_DARTBOARD_NAME",
  "is_completed": false,
  "status": "In Progress",
  "limit": 10
}
```

---

## Workflow 2: Execute and Complete a Task

Full workflow from fetching task details to marking complete.

### Step 1: Get Full Task Details

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart-query"
  tool_name: "get_task"
  parameters: {"id": "TASK_ID"}
```

### Step 2: Update Status to In Progress

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart-query"
  tool_name: "update_task"
  parameters: {
    "id": "TASK_ID",
    "item": {
      "id": "TASK_ID",
      "status": "In Progress"
    }
  }
```

### Step 3: (Do the work)

Execute the task requirements...

### Step 4: Mark Task Complete

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart-query"
  tool_name: "update_task"
  parameters: {
    "id": "TASK_ID",
    "item": {
      "id": "TASK_ID",
      "status": "Done"
    }
  }
```

### Step 5: Add Completion Comment

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart-query"
  tool_name: "add_task_comment"
  parameters: {
    "item": {
      "taskId": "TASK_ID",
      "text": "## Summary\n\nCompleted implementation of [feature].\n\n## Changes Made\n- Item 1\n- Item 2\n\n## Testing\n- All tests passing"
    }
  }
```

---

## Workflow 3: Create a New Task with Subtasks

Create a parent task and its subtasks.

### Step 1: Create Parent Task

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart-query"
  tool_name: "create_task"
  parameters: {
    "item": {
      "title": "Implement user authentication",
      "description": "## Overview\nAdd login/logout functionality\n\n## Requirements\n- Email/password auth\n- Session management\n- Password reset",
      "dartboard": "Personal/my-project",
      "priority": "High",
      "tags": ["feature", "security"]
    }
  }
```

Save the returned `id` as `PARENT_ID`.

### Step 2: Create Subtasks

```
# Subtask 1
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart-query"
  tool_name: "create_task"
  parameters: {
    "item": {
      "title": "Design login form UI",
      "parentId": "PARENT_ID",
      "dartboard": "Personal/my-project"
    }
  }

# Subtask 2
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart-query"
  tool_name: "create_task"
  parameters: {
    "item": {
      "title": "Implement auth API endpoints",
      "parentId": "PARENT_ID",
      "dartboard": "Personal/my-project"
    }
  }

# Subtask 3
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart-query"
  tool_name: "create_task"
  parameters: {
    "item": {
      "title": "Add session management",
      "parentId": "PARENT_ID",
      "dartboard": "Personal/my-project"
    }
  }
```

---

## Workflow 4: Daily Standup Review

Get your assigned tasks and recent activity.

### Step 1: Get Your Active Tasks

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart-query"
  tool_name: "list_tasks"
  parameters: {
    "assignee": "your.email@example.com",
    "is_completed": false,
    "o": ["-updated_at"],
    "limit": 10
  }
```

### Step 2: Get Recently Completed

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart-query"
  tool_name: "list_tasks"
  parameters: {
    "assignee": "your.email@example.com",
    "is_completed": true,
    "updated_at_after": "2024-01-01T00:00:00Z",
    "o": ["-updated_at"],
    "limit": 5
  }
```

---

## Workflow 5: Block/Unblock a Task

### Block a Task

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart-query"
  tool_name: "update_task"
  parameters: {
    "id": "TASK_ID",
    "item": {
      "id": "TASK_ID",
      "status": "Blocked"
    }
  }

# Add blocker comment
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart-query"
  tool_name: "add_task_comment"
  parameters: {
    "item": {
      "taskId": "TASK_ID",
      "text": "**Blocked:** Waiting for API specification from backend team"
    }
  }
```

### Unblock a Task

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart-query"
  tool_name: "update_task"
  parameters: {
    "id": "TASK_ID",
    "item": {
      "id": "TASK_ID",
      "status": "To-do"
    }
  }

# Add unblock comment
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart-query"
  tool_name: "add_task_comment"
  parameters: {
    "item": {
      "taskId": "TASK_ID",
      "text": "**Unblocked:** API spec received, ready to proceed"
    }
  }
```

---

## Tips

### Finding Dartboard Names

If you don't know the exact dartboard name, use `get_config`:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart-query"
  tool_name: "get_config"
  parameters: {}
```

Look for `dartboards` array in response.

### Status Values

Common status values (check `get_config` for your workspace):
- `To-do` - Not started
- `In Progress` - Currently working
- `In Review` - Awaiting review
- `Blocked` - Cannot proceed
- `Done` - Completed

### Priority Values

- `Critical` - Immediate attention
- `High` - Important
- `Medium` - Normal priority
- `Low` - When time permits

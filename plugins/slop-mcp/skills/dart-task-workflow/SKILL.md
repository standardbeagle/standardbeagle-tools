---
name: slop-mcp-dart-task-workflow
description: "Step-by-step Dart task workflows via SLOP: fetch, update, complete, create, block. Dart 任務常用工作流，以 SLOP 操作。 Use when: getting active tasks, completing a task, creating subtasks, daily standup review, blocking/unblocking tasks."
disable-model-invocation: true
---

# Dart Task Workflows

以 SLOP 操作 Dart 任務之逐步工作流。

## Prerequisites

- SLOP server running with Dart MCP configured
- Valid Dart workspace credentials

## Workflow 1: Get Active Tasks for a Dartboard

從特定項目取未完成任務。

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

按特定工作流階段添加狀態過濾：

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

從取任務詳情至標記完成之完整流程。

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

執行任務要求...

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

創建父任務及其子任務。

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

保存返回之 `id` 為 `PARENT_ID`。

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

取已分配任務及近期活動。

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

若不知確切面板名，用 `get_config`：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart-query"
  tool_name: "get_config"
  parameters: {}
```

在回應中查 `dartboards` 數組。

### Status Values

常見狀態值（以 `get_config` 確認工作區之值）：
- `To-do` - 未開始
- `In Progress` - 進行中
- `In Review` - 待審查
- `Blocked` - 無法繼續
- `Done` - 已完成

### Priority Values

- `Critical` - 需立即處理
- `High` - 重要
- `Medium` - 正常優先級
- `Low` - 有空時處理

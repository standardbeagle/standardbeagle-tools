---
name: dart-tools
description: Dart MCP tools reference - task management, documents, comments, and workspace configuration
---

# Dart MCP Tools Reference

Complete reference for all 21 tools provided by the Dart MCP server. Use these tools through SLOP to manage tasks, documents, and comments in your Dart workspace.

## Quick Reference Table

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `get_config` | Get workspace configuration | (none) |
| `list_tasks` | List/filter tasks | dartboard, status, assignee |
| `get_task` | Get task details | id (required) |
| `create_task` | Create new task | title (required), dartboard, status |
| `update_task` | Update task properties | id (required), status, assignee |
| `delete_task` | Move task to trash | id (required) |
| `move_task` | Reorder task position | id, afterTaskId/beforeTaskId |
| `add_task_comment` | Add comment to task | taskId, text (required) |
| `list_comments` | List task comments | task_id (required) |
| `add_task_attachment_from_url` | Attach file from URL | id, name, url (required) |
| `add_task_time_tracking` | Track time on task | id, startedAt, finishedAt |
| `list_docs` | List documents | folder, title, text |
| `get_doc` | Get document details | id (required) |
| `create_doc` | Create new document | title (required), folder, text |
| `update_doc` | Update document | id (required), title, text |
| `delete_doc` | Move doc to trash | id (required) |
| `get_dartboard` | Get dartboard info | id (required) |
| `get_folder` | Get folder info | id (required) |
| `get_view` | Get view info | id (required) |
| `retrieve_skill_by_title` | Get Dart skill | title (required) |
| `list_help_center_articles` | Search help articles | query |

## Configuration

### get_config

Get information about the user's workspace, including all available dartboards, statuses, assignees, and custom properties.

**Parameters:** None

**Usage:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart"
  tool_name: "get_config"
  parameters: {}
```

**Response includes:**
- `today` - Current date
- `user` - Current user info (name, email)
- `dartboards` - Array of available dartboard names
- `statuses` - Array of available status values
- `assignees` - Array of team members
- `types` - Task types
- `priorities` - Priority levels (Critical, High, Medium, Low)
- `tags` - Available tags
- `folders` - Document folders
- `customProperties` - Custom property definitions

---

## Task Management

### list_tasks

List tasks with powerful filtering options. Supports pagination with limit/offset.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `dartboard` | string | Filter by dartboard name |
| `status` | string | Filter by status |
| `assignee` | string | Filter by assignee name/email |
| `is_completed` | boolean | Filter completed/incomplete |
| `priority` | string | Filter by priority |
| `tag` | string | Filter by tag |
| `due_at_after` | datetime | Due date after |
| `due_at_before` | datetime | Due date before |
| `limit` | integer | Results per page |
| `offset` | integer | Pagination offset |
| `o` | array | Ordering (order, -created_at, title, etc.) |

**Usage:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart"
  tool_name: "list_tasks"
  parameters: {
    "dartboard": "Personal/my-project",
    "is_completed": false,
    "limit": 20
  }
```

### get_task

Retrieve full details for a specific task.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Task ID (12 alphanumeric chars) |

**Usage:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart"
  tool_name: "get_task"
  parameters: {"id": "abc123def456"}
```

**Response includes:** title, type, description, dartboard, status, assignee, priority, dueAt, tags, attachments, parentId, createdAt, updatedAt, htmlUrl

### create_task

Create a new task. Defaults to current user as assignee and default dartboard.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `item.title` | string | Yes | Task title |
| `item.description` | string | No | Markdown description |
| `item.dartboard` | string | No | Target dartboard |
| `item.status` | string | No | Initial status |
| `item.assignee` | string | No | Assignee name/email |
| `item.priority` | string | No | Critical/High/Medium/Low |
| `item.dueAt` | string | No | Due date (YYYY-MM-DD) |
| `item.tags` | array | No | Tag strings |
| `item.parentId` | string | No | Parent task ID for subtasks |

**Usage:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart"
  tool_name: "create_task"
  parameters: {
    "item": {
      "title": "Implement feature X",
      "description": "## Requirements\n- Item 1\n- Item 2",
      "dartboard": "Personal/my-project",
      "status": "To-do",
      "priority": "High"
    }
  }
```

### update_task

Update properties of an existing task. Only specified fields are changed.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Task ID |
| `item.id` | string | Yes | Task ID (in item) |
| `item.title` | string | No | New title |
| `item.status` | string | No | New status |
| `item.assignee` | string | No | New assignee |
| `item.description` | string | No | New description |
| `item.priority` | string | No | New priority |
| `item.dueAt` | string/null | No | New due date or null to clear |

**Usage:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart"
  tool_name: "update_task"
  parameters: {
    "id": "abc123def456",
    "item": {
      "id": "abc123def456",
      "status": "Done"
    }
  }
```

### delete_task

Move a task to trash (can be recovered).

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Task ID |

### move_task

Reorder a task within a list. Use `afterTaskId` to place after a task, or `beforeTaskId` to place before.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Task ID to move |
| `afterTaskId` | string/null | No | Place after this task (null = end) |
| `beforeTaskId` | string/null | No | Place before this task (null = start) |

### add_task_time_tracking

Record time spent on a task.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Task ID |
| `startedAt` | string | Yes | Start time (ISO 8601) |
| `finishedAt` | string | Yes | End time (ISO 8601) |
| `user` | string/null | No | User to attribute (null = current) |

### add_task_attachment_from_url

Attach a file to a task by URL.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Task ID |
| `name` | string | Yes | Attachment filename |
| `url` | string | Yes | URL to download from |

---

## Comments

### add_task_comment

Add a comment to a task.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `item.taskId` | string | Yes | Task ID |
| `item.text` | string | Yes | Comment text (markdown) |
| `item.parentId` | string | No | Parent comment ID for threading |

**Usage:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart"
  tool_name: "add_task_comment"
  parameters: {
    "item": {
      "taskId": "abc123def456",
      "text": "Completed implementation. Ready for review."
    }
  }
```

### list_comments

List comments for a task with filtering.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `task_id` | string | Yes | Task ID |
| `author` | string | No | Filter by author |
| `published_at_after` | datetime | No | After date |
| `o` | array | No | Ordering (published_at, hierarchical) |
| `limit` | integer | No | Results per page |

---

## Documents

### list_docs

List documents with filtering and search.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `folder` | string | Filter by folder name |
| `title` | string | Filter by title |
| `s` | string | Full-text search |
| `limit` | integer | Results per page |
| `o` | array | Ordering |

### get_doc

Get full document content.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Document ID |

### create_doc

Create a new document.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `item.title` | string | Yes | Document title |
| `item.text` | string | No | Document content (markdown) |
| `item.folder` | string | No | Target folder |

### update_doc

Update document properties.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Document ID |
| `item.id` | string | Yes | Document ID |
| `item.title` | string | No | New title |
| `item.text` | string | No | New content |
| `item.folder` | string | No | New folder |

### delete_doc

Move document to trash.

---

## Workspace Objects

### get_dartboard

Get dartboard (project) information.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Dartboard ID |

### get_folder

Get folder information.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Folder ID |

### get_view

Get view information.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | View ID |

---

## Help & Skills

### retrieve_skill_by_title

Get a Dart skill (instruction template) by title.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | Yes | Skill title |

### list_help_center_articles

Search Dart help center articles.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Search query (1-5 words) |

---

## Common Workflows

### Complete a Task

```
# 1. Update status to Done
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart"
  tool_name: "update_task"
  parameters: {
    "id": "TASK_ID",
    "item": {"id": "TASK_ID", "status": "Done"}
  }

# 2. Add completion comment
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart"
  tool_name: "add_task_comment"
  parameters: {
    "item": {
      "taskId": "TASK_ID",
      "text": "Completed: [summary of work done]"
    }
  }
```

### Get Active Tasks for a Project

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart"
  tool_name: "list_tasks"
  parameters: {
    "dartboard": "Personal/project-name",
    "is_completed": false,
    "o": ["order"],
    "limit": 20
  }
```

### Create a Subtask

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart"
  tool_name: "create_task"
  parameters: {
    "item": {
      "title": "Subtask title",
      "parentId": "PARENT_TASK_ID",
      "dartboard": "Personal/project-name"
    }
  }
```

## ID Format

All Dart IDs are 12-character alphanumeric strings matching pattern `^[a-zA-Z0-9]{12}$`.

Example: `abc123def456`

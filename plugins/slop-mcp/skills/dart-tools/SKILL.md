---
name: slop-mcp-dart-tools
description: "Complete reference for all 21 Dart MCP tools: tasks, documents, comments, workspace config. Dart MCP 服務器全21工具參考，含任務、文檔、評論、工作區配置。 Use when: looking up tool parameters, understanding response fields, finding right Dart tool for operation."
disable-model-invocation: true
---

# Dart MCP Tools Reference

Dart MCP 服務器全21工具完整參考。通過 SLOP 使用這些工具管理 Dart 工作區中的任務、文檔和評論。

## Quick Reference Table

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `get_config` | 取工作區配置 | (none) |
| `list_tasks` | 列表/過濾任務 | dartboard, status, assignee |
| `get_task` | 取任務詳情 | id (required) |
| `create_task` | 創建新任務 | title (required), dartboard, status |
| `update_task` | 更新任務屬性 | id (required), status, assignee |
| `delete_task` | 移任務至回收站 | id (required) |
| `move_task` | 重排任務位置 | id, afterTaskId/beforeTaskId |
| `add_task_comment` | 為任務添加評論 | taskId, text (required) |
| `list_comments` | 列任務評論 | task_id (required) |
| `add_task_attachment_from_url` | 從URL附加文件 | id, name, url (required) |
| `add_task_time_tracking` | 記錄任務用時 | id, startedAt, finishedAt |
| `list_docs` | 列文檔 | folder, title, text |
| `get_doc` | 取文檔詳情 | id (required) |
| `create_doc` | 創建新文檔 | title (required), folder, text |
| `update_doc` | 更新文檔 | id (required), title, text |
| `delete_doc` | 移文檔至回收站 | id (required) |
| `get_dartboard` | 取面板信息 | id (required) |
| `get_folder` | 取文件夾信息 | id (required) |
| `get_view` | 取視圖信息 | id (required) |
| `retrieve_skill_by_title` | 取 Dart 技藝 | title (required) |
| `list_help_center_articles` | 搜索幫助文章 | query |

## Configuration

### get_config

取用戶工作區信息，含所有可用面板、狀態、受讓人及自定義屬性。

**Parameters:** None

**Usage:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart-query"
  tool_name: "get_config"
  parameters: {}
```

**Response includes:**
- `today` - 當前日期
- `user` - 當前用戶信息（姓名、郵箱）
- `dartboards` - 可用面板名數組
- `statuses` - 可用狀態值數組
- `assignees` - 團隊成員數組
- `types` - 任務類型
- `priorities` - 優先級（Critical, High, Medium, Low）
- `tags` - 可用標籤
- `folders` - 文檔文件夾
- `customProperties` - 自定義屬性定義

---

## Task Management

### list_tasks

以強大過濾選項列任務，支持 limit/offset 分頁。

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `dartboard` | string | 按面板名過濾 |
| `status` | string | 按狀態過濾 |
| `assignee` | string | 按受讓人名/郵箱過濾 |
| `is_completed` | boolean | 過濾已完成/未完成 |
| `priority` | string | 按優先級過濾 |
| `tag` | string | 按標籤過濾 |
| `due_at_after` | datetime | 截止日在此後 |
| `due_at_before` | datetime | 截止日在此前 |
| `limit` | integer | 每頁結果數 |
| `offset` | integer | 分頁偏移 |
| `o` | array | 排序（order, -created_at, title 等）|

**Usage:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart-query"
  tool_name: "list_tasks"
  parameters: {
    "dartboard": "Personal/my-project",
    "is_completed": false,
    "limit": 20
  }
```

### get_task

取特定任務完整詳情。

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | 任務 ID（12位字母數字）|

**Usage:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart-query"
  tool_name: "get_task"
  parameters: {"id": "abc123def456"}
```

**Response includes:** title, type, description, dartboard, status, assignee, priority, dueAt, tags, attachments, parentId, createdAt, updatedAt, htmlUrl

### create_task

創建新任務，默認當前用戶為受讓人及默認面板。

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `item.title` | string | Yes | 任務標題 |
| `item.description` | string | No | Markdown 描述 |
| `item.dartboard` | string | No | 目標面板 |
| `item.status` | string | No | 初始狀態 |
| `item.assignee` | string | No | 受讓人名/郵箱 |
| `item.priority` | string | No | Critical/High/Medium/Low |
| `item.dueAt` | string | No | 截止日（YYYY-MM-DD）|
| `item.tags` | array | No | 標籤字符串 |
| `item.parentId` | string | No | 父任務 ID（子任務用）|

**Usage:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart-query"
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

更新現有任務屬性，僅修改指定字段。

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | 任務 ID |
| `item.id` | string | Yes | 任務 ID（在 item 中）|
| `item.title` | string | No | 新標題 |
| `item.status` | string | No | 新狀態 |
| `item.assignee` | string | No | 新受讓人 |
| `item.description` | string | No | 新描述 |
| `item.priority` | string | No | 新優先級 |
| `item.dueAt` | string/null | No | 新截止日或 null 清除 |

**Usage:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart-query"
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

移任務至回收站（可恢復）。

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | 任務 ID |

### move_task

在列表中重排任務。用 `afterTaskId` 置於某任務後，或 `beforeTaskId` 置於其前。

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | 要移動之任務 ID |
| `afterTaskId` | string/null | No | 置於此任務後（null = 末尾）|
| `beforeTaskId` | string/null | No | 置於此任務前（null = 開頭）|

### add_task_time_tracking

記錄任務用時。

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | 任務 ID |
| `startedAt` | string | Yes | 開始時間（ISO 8601）|
| `finishedAt` | string | Yes | 結束時間（ISO 8601）|
| `user` | string/null | No | 歸屬用戶（null = 當前）|

### add_task_attachment_from_url

通過 URL 為任務附加文件。

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | 任務 ID |
| `name` | string | Yes | 附件文件名 |
| `url` | string | Yes | 下載來源 URL |

---

## Comments

### add_task_comment

為任務添加評論。

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `item.taskId` | string | Yes | 任務 ID |
| `item.text` | string | Yes | 評論文本（markdown）|
| `item.parentId` | string | No | 父評論 ID（用於線程）|

**Usage:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart-query"
  tool_name: "add_task_comment"
  parameters: {
    "item": {
      "taskId": "abc123def456",
      "text": "Completed implementation. Ready for review."
    }
  }
```

### list_comments

列任務評論並過濾。

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `task_id` | string | Yes | 任務 ID |
| `author` | string | No | 按作者過濾 |
| `published_at_after` | datetime | No | 此日期後 |
| `o` | array | No | 排序（published_at, hierarchical）|
| `limit` | integer | No | 每頁結果數 |

---

## Documents

### list_docs

列文檔並過濾搜索。

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `folder` | string | 按文件夾名過濾 |
| `title` | string | 按標題過濾 |
| `s` | string | 全文搜索 |
| `limit` | integer | 每頁結果數 |
| `o` | array | 排序 |

### get_doc

取文檔完整內容。

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | 文檔 ID |

### create_doc

創建新文檔。

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `item.title` | string | Yes | 文檔標題 |
| `item.text` | string | No | 文檔內容（markdown）|
| `item.folder` | string | No | 目標文件夾 |

### update_doc

更新文檔屬性。

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | 文檔 ID |
| `item.id` | string | Yes | 文檔 ID |
| `item.title` | string | No | 新標題 |
| `item.text` | string | No | 新內容 |
| `item.folder` | string | No | 新文件夾 |

### delete_doc

移文檔至回收站。

---

## Workspace Objects

### get_dartboard

取面板（項目）信息。

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | 面板 ID |

### get_folder

取文件夾信息。

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | 文件夾 ID |

### get_view

取視圖信息。

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | 視圖 ID |

---

## Help & Skills

### retrieve_skill_by_title

按標題取 Dart 技藝（指令模板）。

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | Yes | 技藝標題 |

### list_help_center_articles

搜索 Dart 幫助中心文章。

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | 搜索查詢（1-5個詞）|

---

## Common Workflows

### Complete a Task

```
# 1. Update status to Done
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart-query"
  tool_name: "update_task"
  parameters: {
    "id": "TASK_ID",
    "item": {"id": "TASK_ID", "status": "Done"}
  }

# 2. Add completion comment
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "dart-query"
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
  mcp_name: "dart-query"
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
  mcp_name: "dart-query"
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

所有 Dart ID 為12字符字母數字字符串，匹配模式 `^[a-zA-Z0-9]{12}$`。

Example: `abc123def456`

## Related

- `dart-query` plugin — Dart 任務**語義**權威：更全之 CRUD、增量更新、關係、querying / 全文搜 / 分頁、DartQL、批量、生命周期、workspace 文檔/時間、監察、重複任務、PM 配方。本技藝為 **SLOP-執行** 參考（經 `execute_tool` 調 21 工具之參數/響應），任務語義與更豐工作流歸 dart-query。入口 `dart-query:recommender` 網關。

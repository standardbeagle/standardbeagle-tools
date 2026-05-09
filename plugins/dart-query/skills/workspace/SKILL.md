---
name: workspace
description: dart-query workspace tools - documents, comments, time tracking, attachments, and task positioning. 文檔管理、注釋、時間追蹤、附件、任務定位諸工具. Use when: create document, list docs, add comment, log time, attach URL, move task, reposition task
---

# dart-query Workspace

Dart中之文檔管理、注釋、時間追蹤、URL附件及任務移動。

## Access Pattern (all examples below use this)

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "<tool-name>"
  parameters: { ... }
```

---

## Document Management

### list_docs — List Documents

**Optional filters:**
```yaml
folder: dart_id          # filter by folder
title_contains: string
text_contains: string
limit: integer           # default 50
offset: integer          # default 0
```

**Example:**
```yaml
tool_name: list_docs
parameters:
  title_contains: "onboarding"
  limit: 20
```

---

### create_doc — Create a Document

**Required:** `title` (string), `text` (string, markdown supported)
**Optional:** `folder` (dart_id)

**Example:**
```yaml
tool_name: create_doc
parameters:
  title: "Sprint Retro Notes"
  text: "## What went well\n- Fast delivery\n\n## Improvements\n- Better estimates"
  folder: "FOLDER_DART_ID"
```

---

### get_doc — Retrieve a Document

**Required:** `doc_id` (dart_id)

```yaml
tool_name: get_doc
parameters:
  doc_id: "DOC_DART_ID"
```

---

### update_doc — Update a Document

**Required:** `doc_id` (dart_id), `updates` object (one or more fields)

> 注意：`update_doc`使用`updates`包裝對象——與直接取平鋪參數之`update_task`不同。

```yaml
updates:
  title: string    # optional
  text: string     # optional, replaces full content
  folder: dart_id  # optional
```

**Example:**
```yaml
tool_name: update_doc
parameters:
  doc_id: "DOC_DART_ID"
  updates:
    title: "Sprint Retro Notes — Revised"
    text: "## Updated content\n- New section added"
```

---

### delete_doc — Delete a Document

**Required:** `doc_id` (dart_id). 軟刪除——可從回收站恢復。

```yaml
tool_name: delete_doc
parameters:
  doc_id: "DOC_DART_ID"
```

---

## Comments

### add_task_comment — Add a Comment to a Task

**Required:** `dart_id` (task dart_id), `text` (string, markdown supported)

> 亦可通過`create_task`/`update_task`上之`comment`參數內聯添加（見task-crud技能）。

**Example:**
```yaml
tool_name: add_task_comment
parameters:
  dart_id: "TASK_DART_ID"
  text: "Blocked by infra provisioning — ETA Friday."
```

---

### list_comments — List Comments on a Task

**Required:** `task_id` (dart_id)
**Optional:** `limit` (default 50, max 100), `offset` (default 0)

**Example:**
```yaml
tool_name: list_comments
parameters:
  task_id: "TASK_DART_ID"
  limit: 25
```

---

## Time Tracking

### add_time_tracking — Log Time on a Task

**Required:** `dart_id` (task dart_id), `started_at` (ISO8601)

**Optional:**
```yaml
finished_at: ISO8601     # use finished_at OR duration_minutes, not both
duration_minutes: int    # integer minutes
note: string             # description of work done
```

**Example — start/end times:**
```yaml
tool_name: add_time_tracking
parameters:
  dart_id: "TASK_DART_ID"
  started_at: "2026-04-09T09:00:00Z"
  finished_at: "2026-04-09T11:30:00Z"
  note: "Implemented auth module"
```

**Example — duration only:**
```yaml
tool_name: add_time_tracking
parameters:
  dart_id: "TASK_DART_ID"
  started_at: "2026-04-09T14:00:00Z"
  duration_minutes: 45
  note: "Code review"
```

---

## Attachments

### attach_url — Attach a URL to a Task

**Required:** `dart_id` (task dart_id), `url` (must be publicly accessible)
**Optional:** `filename` (string, overrides auto-detected name)

**Example:**
```yaml
tool_name: attach_url
parameters:
  dart_id: "TASK_DART_ID"
  url: "https://www.figma.com/file/ABC123/design-mockup"
  filename: "design-mockup.fig"
```

---

## Task Movement

### move_task — Move or Reposition a Task

**Required:** `dart_id` (task dart_id)

**Optional — use exactly ONE positioning method:**
```yaml
dartboard: dart_id   # move to a different dartboard
order: integer       # 0-based position index within the dartboard
before_id: dart_id   # place immediately before this task
after_id: dart_id    # place immediately after this task
```

可組合`dartboard`與一種定位方式，一次調用完成移動與定位。

**Example — move to different dartboard:**
```yaml
tool_name: move_task
parameters:
  dart_id: "TASK_DART_ID"
  dartboard: "TARGET_BOARD_DART_ID"
  after_id: "ANCHOR_TASK_DART_ID"
```

**Example — reposition within same board:**
```yaml
tool_name: move_task
parameters:
  dart_id: "TASK_DART_ID"
  order: 0
```

> 批量移動任務用`execute_dartql`——見batch-ops技能。

---

## Known Server Issues (dart-query v0.10.3)

- **`add_task_comment`** — may return 404 for newly created tasks due to API propagation delay; retries automatically but may still fail. Use `comment` param on `create_task` as a more reliable alternative.
- **`get_folder`** — may reject valid folder names; use `get_config` with `include: ["folders"]` as workaround.

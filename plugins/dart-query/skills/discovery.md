---
name: discovery
description: dart-query progressive discovery and workspace configuration - info, get_config, get_dartboard, get_folder. 漸進探索dart-query能力，載入工作區配置. Use when: explore dart-query tools, load workspace config, check dartboard details, discover available statuses, initialize session
---

# dart-query Discovery and Workspace Configuration

以此諸工具探索dart-query能力，於查詢任務前載入工作區上下文。

## Access Pattern (all examples below use this)

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "<tool-name>"
  parameters: { ... }
```

---

## info — Progressive Discovery

漸進探索dart-query能力，無需預先載入完整schema。

**Parameters:**
- `level` (enum): `overview` | `group` | `tool`
- `target` (string, optional): group name or tool name — required for `group` and `tool` levels

**Token budget:** ~150 tokens for overview, ~500 for tool details

不知用何工具時，**從此始**。

### Example: Get tool overview
```yaml
tool_name: info
parameters:
  level: overview
```

### Example: Explore a group
```yaml
tool_name: info
parameters:
  level: group
  target: "task-crud"   # Valid groups: discovery, config, task-crud, task-query, task-batch, doc-crud, import
```

### Example: Full schema for a specific tool
```yaml
tool_name: info
parameters:
  level: tool
  target: "execute_dartql"  # Tool-level docs available for: info, get_config, execute_dartql, batch_update_tasks, import_tasks_csv, relationships
```

---

## get_config — Workspace Configuration

載入工作區元數據：受派者、看板、狀態、標籤、優先級、大小、文件夾。

**Parameters:**
- `include` (array): one or more of `assignees`, `dartboards`, `statuses`, `tags`, `priorities`, `sizes`, `folders`
- `cache_bust` (boolean, optional): force refresh, bypassing the 5-minute cache

**各節包含：**
- `assignees` — name, email (objects)
- `dartboards` — flat strings ("Space/Name" format)
- `statuses` — flat strings (workspace-specific, e.g. "To-do", "Doing", "Done")
- `tags` — flat strings
- `priorities` — flat strings (e.g. "Critical", "High", "Medium", "Low")
- `sizes` — flat strings
- `folders` — flat strings ("Space/Name" format)

**緩存：** 結果緩存5分鐘。會話開始時調用一次，後續複用。

### Example: Load everything
```yaml
tool_name: get_config
parameters:
  include: ["assignees", "dartboards", "statuses", "tags", "priorities", "sizes", "folders"]
```

### Example: Load only what you need
```yaml
tool_name: get_config
parameters:
  include: ["dartboards", "statuses"]
```

### Example: Force refresh
```yaml
tool_name: get_config
parameters:
  include: ["assignees", "dartboards"]
  cache_bust: true
```

---

## get_dartboard — Dartboard Details

取單一看板詳情，含當前任務計數。

**Parameters:**
- `dartboard_id` (string): dart_id or dartboard name

**適用：** 批量操作前核查任務計數，避免超載。

### Example
```yaml
tool_name: get_dartboard
parameters:
  dartboard_id: "Sprint 42"
```

---

## get_folder — Folder Details

取單一文件夾詳情，含當前文檔計數。

**Parameters:**
- `folder_id` (string): dart_id or folder name

### Example
```yaml
tool_name: get_folder
parameters:
  folder_id: "Engineering Docs"
```

---

## Session Initialization Recipe

任何查詢或修改任務之會話，依此順序初始化：

**Step 1 — Load workspace config** (assignees, dartboards, statuses)
```yaml
tool_name: get_config
parameters:
  include: ["assignees", "dartboards", "statuses"]
```

**Step 2 — Inspect the current sprint dartboard**
```yaml
tool_name: get_dartboard
parameters:
  dartboard_id: "<sprint name from step 1>"
```

**Step 3 — List in-progress work**
```yaml
tool_name: list_tasks
parameters:
  dartboard: "<sprint name>"
  status: "In Progress"
```

第一步配置結果緩存供整個會話復用。僅在工作區成員或結構可能變更時再次調用`get_config`。

---
name: discovery
description: dart-query progressive discovery and workspace configuration - info, get_config, get_dartboard, get_folder
---

# dart-query Discovery and Workspace Configuration

Use these tools to explore dart-query capabilities and load workspace context before querying tasks.

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

Explore dart-query capabilities without loading the full schema upfront.

**Parameters:**
- `level` (enum): `overview` | `group` | `tool`
- `target` (string, optional): group name or tool name — required for `group` and `tool` levels

**Token budget:** ~150 tokens for overview, ~500 for tool details

**Start here** when you don't know which tool to use.

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

Load workspace metadata: assignees, dartboards, statuses, tags, priorities, sizes, and folders.

**Parameters:**
- `include` (array): one or more of `assignees`, `dartboards`, `statuses`, `tags`, `priorities`, `sizes`, `folders`
- `cache_bust` (boolean, optional): force refresh, bypassing the 5-minute cache

**What each section contains:**
- `assignees` — name, email (objects)
- `dartboards` — flat strings ("Space/Name" format)
- `statuses` — flat strings (workspace-specific, e.g. "To-do", "Doing", "Done")
- `tags` — flat strings
- `priorities` — flat strings (e.g. "Critical", "High", "Medium", "Low")
- `sizes` — flat strings
- `folders` — flat strings ("Space/Name" format)

**Cache:** Results are cached for 5 minutes. Call once at session start and reuse.

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

Fetch details for a single dartboard, including its current task count.

**Parameters:**
- `dartboard_id` (string): dart_id or dartboard name

**When to use:** Check task count before bulk operations to avoid overloading a board.

### Example
```yaml
tool_name: get_dartboard
parameters:
  dartboard_id: "Sprint 42"
```

---

## get_folder — Folder Details

Fetch details for a single folder, including its current doc count.

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

Follow this sequence at the start of any session that will query or modify tasks:

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

Cache the config results from Step 1 for the rest of the session. Only call `get_config` again if workspace membership or structure may have changed.

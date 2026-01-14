---
name: figma-tree
description: Get the file structure as an ASCII tree or JSON with node IDs for navigation
---

# Figma Get Tree Tool

The `get_tree` tool returns the hierarchical structure of a Figma file as an ASCII tree or JSON, with node IDs for subsequent drilling down.

## Tool Parameters

```yaml
tool: get_tree
parameters:
  file_key: "your-figma-file-key"  # required
  depth: 3                          # optional - max depth (default: 3)
  max_nodes: 500                    # optional - max nodes (default: 500)
  hide_ids: false                   # optional - hide node IDs
  output_file: "./tree.txt"         # optional - save to file
```

## Output Formats

### ASCII Tree (default)
```
My Design System
├── [1:1] Cover
│   └── [1:2] Title
├── [2:1] Components
│   ├── [2:2] Buttons
│   │   ├── [2:3] Button/Primary
│   │   ├── [2:4] Button/Secondary
│   │   └── [2:5] Button/Tertiary
│   └── [2:10] Icons
│       ├── [2:11] icon-search
│       └── [2:12] icon-home
└── [3:1] Screens
    ├── [3:2] Home
    └── [3:3] Dashboard
```

### JSON (with hide_ids: false)
```json
{
  "tree": [
    {
      "id": "1:1",
      "name": "Cover",
      "type": "CANVAS",
      "children": [...]
    }
  ]
}
```

## Usage Examples

### Get Overview (Default)
```yaml
mcp_name: figma-query
tool_name: get_tree
parameters:
  file_key: "ABC123xyz"
```

### Deep Exploration
```yaml
mcp_name: figma-query
tool_name: get_tree
parameters:
  file_key: "ABC123xyz"
  depth: 5
  max_nodes: 1000
```

### Save to File
```yaml
mcp_name: figma-query
tool_name: get_tree
parameters:
  file_key: "ABC123xyz"
  output_file: "./design-structure.txt"
```

### Clean View (No IDs)
```yaml
mcp_name: figma-query
tool_name: get_tree
parameters:
  file_key: "ABC123xyz"
  hide_ids: true
```

## Response

```json
{
  "tree": [...],
  "text": "ASCII tree string...",
  "total": 234,
  "returned": 234,
  "truncated": false,
  "file_path": null
}
```

## Response Fields

| Field | Description |
|-------|-------------|
| `tree` | JSON representation of structure |
| `text` | ASCII tree string |
| `total` | Total nodes in file |
| `returned` | Nodes included in response |
| `truncated` | True if max_nodes exceeded |
| `file_path` | Path if saved to file |

## Using Node IDs

Node IDs from the tree can be used with other tools:

```yaml
# Get details for specific node
get_node: node_id: "2:3"

# Get CSS for nodes
get_css: node_ids: ["2:3", "2:4", "2:5"]

# Export specific components
export_assets: node_ids: ["2:11", "2:12"]

# Query from specific node
query: q: { from: ["#2:2"] }  # Query within Buttons frame
```

## Common Workflows

### Initial Exploration
```yaml
# 1. Get tree overview
get_tree: depth: 2

# 2. Identify interesting branches

# 3. Drill down with deeper tree
get_tree: depth: 5, max_nodes: 100
```

### Component Discovery
```yaml
# 1. Get component structure
get_tree: depth: 4

# 2. Note component IDs from tree

# 3. Get details with get_node
get_node: node_id: "...", select: ["@css", "@tokens"]
```

### File Navigation Pattern
```
1. get_tree (overview) → note page IDs
2. get_tree on specific page → note frame IDs
3. get_node for specific frame → full details
```

## Depth Guidelines

| Depth | Use Case |
|-------|----------|
| 1 | Pages only |
| 2 | Pages + top-level frames |
| 3 | General overview (default) |
| 4-5 | Component exploration |
| 6+ | Deep dive into nested structures |

## Max Nodes Guidelines

| Nodes | Use Case |
|-------|----------|
| 100 | Quick preview |
| 500 | Default exploration |
| 1000 | Comprehensive view |
| 2000+ | Full file analysis (may be slow) |

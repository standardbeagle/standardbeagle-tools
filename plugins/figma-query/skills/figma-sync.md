---
name: figma-sync
description: Export a complete Figma file to a local grep-friendly folder structure for offline analysis and caching
---

# Figma Sync Tool

The `sync_file` tool exports an entire Figma file to a nested folder structure, enabling offline analysis, grep-based searching, and local caching for faster subsequent queries.

## Tool Parameters

```yaml
tool: sync_file
parameters:
  file_key: "your-figma-file-key"  # required - from Figma URL
  output_dir: "./figma-export"     # optional - export destination
  include: ["pages", "components", "styles", "variables"]  # optional
  assets: true                      # optional - download image assets
```

## Getting the File Key

From a Figma URL like:
```
https://www.figma.com/design/ABC123xyz/My-Design-System
                            ^^^^^^^^^^^
                            This is the file_key
```

## Output Structure

```
<output_dir>/<file-name>/
├── _meta.json              # File metadata, export timestamp
├── _tree.txt               # ASCII tree with node IDs
├── _index.json             # Flat lookup: node_id → path
├── pages/
│   └── <page-name>/
│       └── children/
│           └── <node-name>/
│               ├── _node.json      # Full node data
│               ├── _css.json       # CSS properties
│               ├── _tokens.json    # Variable references
│               └── children/       # Recursive children
├── components/
│   └── _components.json    # All components inventory
├── styles/
│   ├── colors.json         # Color styles
│   ├── typography.json     # Text styles
│   ├── effects.json        # Effect styles (shadows, blur)
│   └── grids.json          # Grid styles
├── variables/
│   ├── tokens.json         # Design tokens
│   └── collections/        # Variable collections
└── assets/                 # Image assets (if enabled)
    ├── fills/              # Image fills
    └── renders/            # Exported node renders
```

## Usage Examples

### Full File Sync with Assets
```yaml
mcp_name: figma-query
tool_name: sync_file
parameters:
  file_key: "ABC123xyz"
  output_dir: "./design-system"
  assets: true
```

### Sync Only Components and Styles
```yaml
mcp_name: figma-query
tool_name: sync_file
parameters:
  file_key: "ABC123xyz"
  include: ["components", "styles"]
```

### Minimal Sync (Structure Only)
```yaml
mcp_name: figma-query
tool_name: sync_file
parameters:
  file_key: "ABC123xyz"
  include: ["pages"]
  assets: false
```

## Response

```json
{
  "export_path": "/path/to/export/My-Design-System",
  "stats": {
    "pages": 5,
    "nodes": 1234,
    "components": 87,
    "styles": 42,
    "assets": 156
  },
  "tree_preview": "...",
  "errors": []
}
```

## Benefits

### Offline Analysis
Once synced, use standard Unix tools:
```bash
# Find all buttons
grep -r "Button" ./design-system/components/

# Find nodes using specific color
grep -r "#FF5500" ./design-system/pages/

# List all text styles
cat ./design-system/styles/typography.json | jq '.styles[].name'
```

### Faster Queries
After sync, use `from_cache: true` in queries to skip API calls:
```yaml
tool: query
parameters:
  file_key: "ABC123xyz"
  from_cache: true
  q:
    from: ["COMPONENT"]
```

### Version Control
Export structure is git-friendly for tracking design changes over time.

## When to Use

- **Starting a new project**: Sync entire design file for exploration
- **Before bulk operations**: Cache locally to avoid rate limits
- **For documentation**: Generate reports from local files
- **For CI/CD**: Include design assets in build pipelines

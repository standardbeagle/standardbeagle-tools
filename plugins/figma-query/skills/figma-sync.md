---
name: figma-sync
description: Export a complete Figma file to a local grep-friendly folder structure for offline analysis and caching. 將完整 Figma 文件導出為本地目錄，支持離線分析與緩存。 Use when: caching a Figma file locally, enabling offline queries, starting bulk operations, preparing for documentation, setting up CI/CD design pipeline
---

# Figma Sync Tool

`sync_file` 工具將整個 Figma 文件導出為嵌套目錄結構，支持離線分析、grep 搜索與本地緩存，加速後續查詢。

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

從如下 Figma URL 提取：
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
同步後，可用標準 Unix 工具：
```bash
# Find all buttons
grep -r "Button" ./design-system/components/

# Find nodes using specific color
grep -r "#FF5500" ./design-system/pages/

# List all text styles
cat ./design-system/styles/typography.json | jq '.styles[].name'
```

### Faster Queries
同步後，查詢加 `from_cache: true` 跳過 API 調用：
```yaml
tool: query
parameters:
  file_key: "ABC123xyz"
  from_cache: true
  q:
    from: ["COMPONENT"]
```

### Version Control
導出結構對 git 友好，可追蹤設計變更歷史。

## When to Use

- **新項目起始**：同步完整設計文件以便探索
- **批量操作前**：本地緩存避免速率限制
- **生成文檔**：從本地文件生成報告
- **CI/CD**：構建管線中包含設計資產

---
name: design-sync
description: "Sync Figma file to local storage for offline analysis and faster queries. 同步 Figma 文件至本地，供離線分析與快速查詢。 Use when: syncing figma file locally, caching figma for offline use, speeding up repeated queries, preparing for grep-based search, downloading full figma structure"
arguments:
  - name: file_key
    description: "Figma file key (from URL)"
    required: true
  - name: output_dir
    description: "Output directory (default: ./figma-export)"
    required: false
---

# Figma Design Sync

同步完整 Figma 文件至本地，供離線分析、grep 搜索及快速後續查詢。

## Usage

```
/design-sync <file_key> [output_dir]
```

## Getting the File Key

From a Figma URL:
```
https://www.figma.com/design/ABC123xyz/My-Design-System
                            ^^^^^^^^^^^
                            This is the file_key
```

## Sync Process

### 1. Full File Sync

Execute the sync:

```yaml
mcp_name: figma-query
tool_name: sync_file
parameters:
  file_key: "${file_key}"
  output_dir: "${output_dir:-./figma-export}"
  assets: true
```

### 2. Review Structure

同步後覽樹：

```yaml
mcp_name: figma-query
tool_name: get_tree
parameters:
  file_key: "${file_key}"
  depth: 3
```

### 3. List Components

取組件清單：

```yaml
mcp_name: figma-query
tool_name: list_components
parameters:
  file_key: "${file_key}"
  include_usage: true
```

### 4. List Styles

取樣式清單：

```yaml
mcp_name: figma-query
tool_name: list_styles
parameters:
  file_key: "${file_key}"
```

## Output Structure

同步後輸出目錄結構：

```
<output_dir>/<file-name>/
├── _meta.json              # File metadata
├── _tree.txt               # ASCII tree with IDs
├── _index.json             # Node ID → path mapping
├── pages/
│   └── <page-name>/
│       └── children/...
├── components/
│   └── _components.json
├── styles/
│   ├── colors.json
│   ├── typography.json
│   └── effects.json
├── variables/
│   └── tokens.json
└── assets/
    ├── fills/
    └── renders/
```

## Offline Analysis

同步後可用標準 Unix 工具分析：

```bash
# Find all buttons
grep -r "Button" ./figma-export/components/

# Find nodes using specific color
grep -r "#FF5500" ./figma-export/pages/

# List all text styles
cat ./figma-export/styles/typography.json | jq '.styles[].name'

# Find all components containing "Card"
find ./figma-export -name "*Card*" -type d
```

## Faster Queries

同步後以 `from_cache: true` 加速本地查詢：

```yaml
mcp_name: figma-query
tool_name: query
parameters:
  file_key: "${file_key}"
  from_cache: true
  q:
    from: ["COMPONENT"]
    select: ["@structure"]
```

## Next Steps

同步後可繼續：
- 用 `get_tree` 探索結構
- 用 `search` 查找特定元素
- 用 `list_components` 盤點組件
- 用 `/extract-library` 提取完整設計庫

---
name: design-sync
description: Sync a Figma file to local storage for offline analysis and faster queries
arguments:
  - name: file_key
    description: Figma file key (from URL)
    required: true
  - name: output_dir
    description: Output directory (default: ./figma-export)
    required: false
---

# Figma Design Sync

Sync a complete Figma file to local storage for offline analysis, grep-based searching, and faster subsequent queries.

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

After sync, view the tree:

```yaml
mcp_name: figma-query
tool_name: get_tree
parameters:
  file_key: "${file_key}"
  depth: 3
```

### 3. List Components

Get component inventory:

```yaml
mcp_name: figma-query
tool_name: list_components
parameters:
  file_key: "${file_key}"
  include_usage: true
```

### 4. List Styles

Get style inventory:

```yaml
mcp_name: figma-query
tool_name: list_styles
parameters:
  file_key: "${file_key}"
```

## Output Structure

After sync, your output directory contains:

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

After sync, use standard Unix tools:

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

After sync, use `from_cache: true` for fast local queries:

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

After syncing:
- Use `get_tree` to explore structure
- Use `search` to find specific elements
- Use `list_components` for component inventory
- Use `/extract-library` for full design library extraction

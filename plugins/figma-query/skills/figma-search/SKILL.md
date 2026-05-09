---
name: figma-query-figma-search
description: "Full-text search across Figma files by name, text content, or properties. 在 Figma 文件中按名稱、文本或屬性全文搜索。 Use when: finding nodes by name pattern, searching text content, finding nodes by color value, locating all icons, searching for components matching a pattern"
disable-model-invocation: true
---

# Figma Search Tool

`search` 工具在 Figma 文件中進行全文搜索，支持 glob 與正則表達式，可搜索節點名稱、文本內容或屬性。

## Tool Parameters

```yaml
tool: search
parameters:
  file_key: "your-figma-file-key"  # required
  pattern: "Button*"               # required - search pattern
  scope: "names"                   # optional - names|text|properties
  node_types: ["COMPONENT"]        # optional - filter by type
  limit: 50                        # optional - max results
```

## Search Scopes

### names (default)
僅搜索節點名稱。
```yaml
scope: "names"
pattern: "icon-*"  # Finds: icon-search, icon-home, icon-user
```

### text
搜索 TEXT 節點中的文本內容。
```yaml
scope: "text"
pattern: "Welcome*"  # Finds text nodes containing "Welcome..."
```

### properties
搜索屬性值（顏色、字體等）。
```yaml
scope: "properties"
pattern: "#FF5500"  # Finds nodes using this color
```

## Pattern Syntax

### Glob Patterns
```yaml
pattern: "Button*"      # Starts with "Button"
pattern: "*Icon"        # Ends with "Icon"
pattern: "*-primary-*"  # Contains "-primary-"
pattern: "Header/???"   # Header/ + exactly 3 chars
```

### Regex Patterns
```yaml
pattern: "^btn-[a-z]+"     # Regex: starts with btn- + letters
pattern: "v[0-9]+\\.[0-9]" # Version numbers like v1.0
```

## Usage Examples

### Find All Icons
```yaml
mcp_name: figma-query
tool_name: search
parameters:
  file_key: "ABC123xyz"
  pattern: "icon-*"
  scope: "names"
```

### Find Error Messages
```yaml
mcp_name: figma-query
tool_name: search
parameters:
  file_key: "ABC123xyz"
  pattern: "*error*"
  scope: "text"
  node_types: ["TEXT"]
```

### Find Components Using Specific Color
```yaml
mcp_name: figma-query
tool_name: search
parameters:
  file_key: "ABC123xyz"
  pattern: "#3B82F6"
  scope: "properties"
```

### Find All Button Components
```yaml
mcp_name: figma-query
tool_name: search
parameters:
  file_key: "ABC123xyz"
  pattern: "*Button*"
  node_types: ["COMPONENT", "INSTANCE"]
  limit: 100
```

## Response

```json
{
  "results": [
    {
      "node_id": "1:234",
      "name": "icon-search",
      "type": "COMPONENT",
      "path": "Icons / Navigation / icon-search",
      "match_context": "icon-search"
    },
    {
      "node_id": "1:235",
      "name": "icon-home",
      "type": "COMPONENT",
      "path": "Icons / Navigation / icon-home",
      "match_context": "icon-home"
    }
  ],
  "total": 24,
  "pattern": "icon-*",
  "scope": "names"
}
```

## Response Fields

| Field | Description |
|-------|-------------|
| `node_id` | Unique node identifier for further queries |
| `name` | Node name |
| `type` | Node type (COMPONENT, FRAME, TEXT, etc.) |
| `path` | Full path from root to node |
| `match_context` | The matched text with context |

## Common Workflows

### Find and Export Icons
```yaml
# 1. Search for icons
search: pattern: "icon-*", scope: "names"

# 2. Extract node_ids from results

# 3. Export as SVG
export_assets: node_ids: [...], formats: ["svg"]
```

### Find and Document Components
```yaml
# 1. Search for components
search: pattern: "*Button*", node_types: ["COMPONENT"]

# 2. For each result, get CSS
get_css: node_ids: [...]

# 3. Document with wireframe
wireframe: node_id: "..."
```

### Find Color Usage
```yaml
# 1. Search for color value
search: pattern: "#FF5500", scope: "properties"

# 2. Results show all nodes using this color

# 3. Verify against design tokens
get_tokens: node_ids: [...]
```

## Performance Tips

1. **精確模式**：越精確搜索越快
2. **過濾類型**：用 `node_types` 縮小搜索範圍
3. **限制結果**：大文件分頁
4. **從緩存搜索**：先 `sync_file`，重複搜索更快

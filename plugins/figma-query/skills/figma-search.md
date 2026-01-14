---
name: figma-search
description: Full-text search across Figma files by name, text content, or properties
---

# Figma Search Tool

The `search` tool provides full-text search across Figma files, searching node names, text content, or properties with glob and regex pattern support.

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
Search node names only.
```yaml
scope: "names"
pattern: "icon-*"  # Finds: icon-search, icon-home, icon-user
```

### text
Search text content within TEXT nodes.
```yaml
scope: "text"
pattern: "Welcome*"  # Finds text nodes containing "Welcome..."
```

### properties
Search property values (colors, fonts, etc.).
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

1. **Use specific patterns**: More specific = faster search
2. **Filter by node_types**: Reduces search space
3. **Limit results**: Use pagination for large files
4. **Search from cache**: Use `sync_file` first for repeated searches

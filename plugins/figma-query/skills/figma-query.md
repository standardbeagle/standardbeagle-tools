---
name: figma-query
description: Execute powerful JSON DSL queries against Figma files with filtering, projection, and pagination
---

# Figma Query Tool

The `query` tool provides a powerful JSON DSL for querying Figma files with filtering, field projection, and pagination support.

## Tool Parameters

```yaml
tool: query
parameters:
  file_key: "your-figma-file-key"  # required
  q:                                # required - query object
    from: ["NODE_TYPE"]             # node types or #id
    where: {}                       # filter conditions
    select: []                      # fields to return
    limit: 100                      # max results
    offset: 0                       # pagination offset
  from_cache: false                 # optional - use local cache
```

## Query Structure

### FROM Clause
Specify node types to query:

```yaml
from: ["COMPONENT"]                    # Single type
from: ["COMPONENT", "INSTANCE"]        # Multiple types
from: ["#1:234"]                       # Specific node by ID
from: ["PAGE > FRAME > COMPONENT"]     # Path pattern
```

Node types: `DOCUMENT`, `CANVAS`, `FRAME`, `GROUP`, `SECTION`, `VECTOR`, `COMPONENT`, `INSTANCE`, `TEXT`, `ELLIPSE`, `POLYGON`, `STAR`, `LINE`, `RECTANGLE`

### WHERE Clause (Filters)
Filter results with operators:

```yaml
where:
  name: { "$eq": "Button" }           # Exact match
  name: { "$match": "Button*" }       # Glob pattern
  name: { "$regex": "^btn-" }         # Regex match
  name: { "$contains": "icon" }       # Substring
  type: { "$in": ["FRAME", "GROUP"] } # Value in array
  width: { "$gt": 100 }               # Greater than
  height: { "$lte": 50 }              # Less than or equal
  visible: { "$exists": true }        # Field exists
  locked: { "$not": true }            # Negation
```

### SELECT Clause (Projections)
Choose what data to return:

```yaml
select: ["@structure"]     # id, name, type, visible, parent_id
select: ["@bounds"]        # x, y, width, height, rotation
select: ["@css"]           # fills, strokes, effects, cornerRadius
select: ["@layout"]        # layoutMode, padding, itemSpacing
select: ["@typography"]    # fontFamily, fontSize, fontWeight
select: ["@tokens"]        # boundVariables, resolvedTokens
select: ["@images"]        # imageRefs, exportSettings
select: ["@children"]      # recursive children
select: ["@all"]           # everything

# Custom fields
select: ["id", "name", "fills", "effects"]
```

## Usage Examples

### Find All Buttons
```yaml
mcp_name: figma-query
tool_name: query
parameters:
  file_key: "ABC123xyz"
  q:
    from: ["COMPONENT"]
    where:
      name: { "$match": "*Button*" }
    select: ["@structure", "@css"]
```

### Get All Text Nodes with Typography
```yaml
mcp_name: figma-query
tool_name: query
parameters:
  file_key: "ABC123xyz"
  q:
    from: ["TEXT"]
    select: ["@structure", "@typography"]
    limit: 50
```

### Find Large Frames
```yaml
mcp_name: figma-query
tool_name: query
parameters:
  file_key: "ABC123xyz"
  q:
    from: ["FRAME"]
    where:
      width: { "$gt": 1000 }
    select: ["@structure", "@bounds"]
```

### Query from Cache
```yaml
mcp_name: figma-query
tool_name: query
parameters:
  file_key: "ABC123xyz"
  from_cache: true
  q:
    from: ["COMPONENT"]
    select: ["@structure"]
```

### Paginated Results
```yaml
mcp_name: figma-query
tool_name: query
parameters:
  file_key: "ABC123xyz"
  q:
    from: ["INSTANCE"]
    limit: 20
    offset: 40
```

## Response

```json
{
  "results": [
    {
      "id": "1:234",
      "name": "Button/Primary",
      "type": "COMPONENT",
      "fills": [...],
      "effects": [...]
    }
  ],
  "total": 156,
  "returned": 20,
  "has_more": true,
  "cursor": "40",
  "cache_hit": false
}
```

## Combining Filters

```yaml
where:
  "$and": [
    { "name": { "$contains": "Button" } },
    { "visible": true },
    { "width": { "$gte": 100 } }
  ]

# OR conditions
where:
  "$or": [
    { "type": "COMPONENT" },
    { "type": "INSTANCE" }
  ]
```

## Performance Tips

1. **Use projections**: Only request fields you need
2. **Use from_cache**: After `sync_file`, query locally
3. **Limit results**: Use pagination for large result sets
4. **Be specific**: Narrow down with precise WHERE clauses
5. **Use node IDs**: Query `#id` for direct access

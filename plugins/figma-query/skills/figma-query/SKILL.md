---
name: figma-query-figma-query
description: "Execute powerful JSON DSL queries against Figma files with filtering, projection, and pagination. 對 Figma 文件執行 JSON DSL 查詢：過濾、投影、分頁。 Use when: finding nodes by type or property, filtering components by name pattern, querying with complex conditions, paginating large result sets, running from local cache"
disable-model-invocation: true
---

# Figma Query Tool

`query` 工具提供強大的 JSON DSL，支持過濾、字段投影與分頁查詢 Figma 文件。

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
指定查詢節點類型：

```yaml
from: ["COMPONENT"]                    # Single type
from: ["COMPONENT", "INSTANCE"]        # Multiple types
from: ["#1:234"]                       # Specific node by ID
from: ["PAGE > FRAME > COMPONENT"]     # Path pattern
```

Node types: `DOCUMENT`, `CANVAS`, `FRAME`, `GROUP`, `SECTION`, `VECTOR`, `COMPONENT`, `INSTANCE`, `TEXT`, `ELLIPSE`, `POLYGON`, `STAR`, `LINE`, `RECTANGLE`

### WHERE Clause (Filters)
過濾操作符：

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
選擇返回字段：

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

1. **善用投影**：只取所需字段
2. **優先本地緩存**：`sync_file` 後用 `from_cache: true`
3. **限制結果集**：大文件分頁查詢
4. **精確條件**：WHERE 子句越窄越快
5. **用節點 ID**：`#id` 直接定位，最快

## Related

- `figma-query:figma-search` — 僅按名稱/文本/屬性做 glob 或正則全文搜索時，更輕便。

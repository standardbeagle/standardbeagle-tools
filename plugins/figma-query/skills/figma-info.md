---
name: figma-info
description: Get help documentation, tool information, and status from the figma-query MCP server
---

# Figma Info Tool

The `info` tool provides progressive discovery of figma-query capabilities, including help documentation, tool listings, query DSL reference, and server status.

## Tool Parameters

```yaml
tool: info
parameters:
  topic: "overview|tools|projections|query|operators|export|examples|status"  # optional
  format: "text|json"  # optional, default: text
```

## Topics

### overview (default)
General introduction to figma-query capabilities and available tools.

### tools
Complete list of all 15 MCP tools with descriptions and parameters.

### projections
Reference for built-in query projections:
- `@structure` - id, name, type, visible, parent_id
- `@bounds` - x, y, width, height, rotation
- `@css` - fills, strokes, effects, cornerRadius, opacity
- `@layout` - layoutMode, padding, itemSpacing, constraints
- `@typography` - fontFamily, fontSize, fontWeight, lineHeight
- `@tokens` - boundVariables, resolvedTokens
- `@images` - imageRefs, exportSettings
- `@children` - recursive children with depth
- `@all` - everything combined

### query
Query DSL documentation with FROM, WHERE, SELECT syntax.

### operators
Filter operators for WHERE clauses:
- `$eq` - exact match
- `$match` - glob pattern matching
- `$regex` - regular expression
- `$contains` - substring match
- `$in` - value in array
- `$gt`, `$gte`, `$lt`, `$lte` - comparisons
- `$exists` - field presence
- `$not` - negation

### export
Export capabilities documentation for assets, tokens, and local caching.

### examples
Workflow examples combining multiple tools.

### status
Server health, connection status, and cache state.

## Usage Examples

### Get Tool Overview
```yaml
mcp_name: figma-query
tool_name: info
parameters: {}
```

### List All Tools (JSON)
```yaml
mcp_name: figma-query
tool_name: info
parameters:
  topic: tools
  format: json
```

### Check Query DSL Reference
```yaml
mcp_name: figma-query
tool_name: info
parameters:
  topic: query
```

### Check Server Status
```yaml
mcp_name: figma-query
tool_name: info
parameters:
  topic: status
```

## When to Use

- **First time setup**: Get overview to understand capabilities
- **Before querying**: Check projections and operators for query construction
- **Debugging**: Check status to verify connection and cache state
- **Learning**: Browse examples for common workflows

## Response Format

### Text Format (default)
Human-readable documentation with examples and explanations.

### JSON Format
Structured data suitable for programmatic consumption:
```json
{
  "topic": "tools",
  "tools": [
    {
      "name": "info",
      "description": "...",
      "parameters": {...}
    }
  ]
}
```

---
name: figma-diff
description: Compare Figma file versions or exports to track design changes
---

# Figma Diff Tool

The `diff` tool compares two versions of a Figma file or two exports, producing a change report with added, modified, and removed elements.

## Tool Parameters

```yaml
tool: diff
parameters:
  file_key: "your-figma-file-key"  # required
  version1: "v1"                    # required - baseline version/export
  version2: "v2"                    # optional - comparison (default: current)
  compare_type: "structure"         # optional - structure|styles|tokens
```

## Compare Types

| Type | What's Compared |
|------|-----------------|
| `structure` | Node hierarchy, names, types |
| `styles` | Visual styles (colors, typography, effects) |
| `tokens` | Variable bindings and values |

## Version Identifiers

### Version Numbers
Use Figma version numbers from file history:
```yaml
version1: "123456789"
version2: "987654321"
```

### Export Paths
Compare local exports (from `sync_file`):
```yaml
version1: "./exports/v1"
version2: "./exports/v2"
```

### Special Values
```yaml
version1: "latest"   # Most recent cached version
version2: "current"  # Live file (default)
```

## Usage Examples

### Compare Current to Previous Version
```yaml
mcp_name: figma-query
tool_name: diff
parameters:
  file_key: "ABC123xyz"
  version1: "123456789"
```

### Compare Two Versions
```yaml
mcp_name: figma-query
tool_name: diff
parameters:
  file_key: "ABC123xyz"
  version1: "123456789"
  version2: "987654321"
```

### Style Changes Only
```yaml
mcp_name: figma-query
tool_name: diff
parameters:
  file_key: "ABC123xyz"
  version1: "123456789"
  compare_type: "styles"
```

### Token Changes
```yaml
mcp_name: figma-query
tool_name: diff
parameters:
  file_key: "ABC123xyz"
  version1: "123456789"
  compare_type: "tokens"
```

### Compare Local Exports
```yaml
mcp_name: figma-query
tool_name: diff
parameters:
  file_key: "ABC123xyz"
  version1: "./figma-export/2024-01"
  version2: "./figma-export/2024-02"
```

## Response

```json
{
  "changes": [
    {
      "type": "added",
      "path": "Components/Buttons/Button/Tertiary",
      "node_id": "1:500",
      "details": {
        "node_type": "COMPONENT"
      }
    },
    {
      "type": "modified",
      "path": "Components/Buttons/Button/Primary",
      "node_id": "1:234",
      "details": {
        "properties_changed": ["fills", "cornerRadius"],
        "before": { "cornerRadius": 4 },
        "after": { "cornerRadius": 8 }
      }
    },
    {
      "type": "removed",
      "path": "Components/Buttons/Button/Deprecated",
      "node_id": "1:100",
      "details": {}
    }
  ],
  "summary": {
    "added": 12,
    "modified": 45,
    "removed": 3,
    "unchanged": 234
  }
}
```

## Change Types

### added
New nodes/styles/tokens that didn't exist in version1.

### modified
Elements that exist in both but have different properties.

### removed
Elements in version1 that don't exist in version2.

## Common Workflows

### Design Review
```yaml
# 1. Get diff between versions
diff: version1: "old_version", version2: "new_version"

# 2. Review changes

# 3. For modified nodes, get details
get_node: node_id: "changed_id"
```

### Regression Check
```yaml
# 1. Sync current file
sync_file: file_key: "...", output_dir: "./current"

# 2. Make changes in Figma

# 3. Compare
diff: version1: "./current", version2: "current"
```

### Token Audit
```yaml
# 1. Diff token changes
diff: version1: "old", compare_type: "tokens"

# 2. Identify variable changes

# 3. Update code accordingly
```

### Style Consistency
```yaml
# 1. Diff style changes
diff: version1: "baseline", compare_type: "styles"

# 2. Review color/typography changes

# 3. Update design tokens
```

## Integration with sync_file

For comprehensive diffing:

```yaml
# 1. Create baseline export
sync_file: output_dir: "./baseline"

# 2. After design changes, create new export
sync_file: output_dir: "./current"

# 3. Compare exports
diff: version1: "./baseline", version2: "./current"
```

## Best Practices

1. **Create baselines**: Use `sync_file` before major changes
2. **Focus comparisons**: Use `compare_type` for specific analysis
3. **Track over time**: Regular diffs catch drift
4. **Document changes**: Use diff reports in PR descriptions
5. **Automate in CI**: Diff on design file changes

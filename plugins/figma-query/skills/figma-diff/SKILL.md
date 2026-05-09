---
name: figma-query-figma-diff
description: "Compare Figma file versions or exports to track design changes. 比較 Figma 文件版本或導出，追蹤設計變更。 Use when: tracking design changes over time, comparing two file versions, auditing style or token changes, regression checking, diffing local exports"
disable-model-invocation: true
---

# Figma Diff Tool

`diff` 工具比較 Figma 文件的兩個版本或兩次導出，生成含新增、修改、刪除元素的變更報告。

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
使用文件歷史中的 Figma 版本號：
```yaml
version1: "123456789"
version2: "987654321"
```

### Export Paths
比較本地導出（來自 `sync_file`）：
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
version1 中不存在的新節點/樣式/令牌。

### modified
兩版本均存在但屬性不同的元素。

### removed
version1 中存在但 version2 中不存在的元素。

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

全面 diff 工作流：

```yaml
# 1. Create baseline export
sync_file: output_dir: "./baseline"

# 2. After design changes, create new export
sync_file: output_dir: "./current"

# 3. Compare exports
diff: version1: "./baseline", version2: "./current"
```

## Best Practices

1. **建立基線**：重大變更前 `sync_file`
2. **聚焦比較**：用 `compare_type` 進行專項分析
3. **持續追蹤**：定期 diff 防止漂移
4. **記錄變更**：PR 描述中附 diff 報告
5. **CI 自動化**：設計文件變更時自動 diff

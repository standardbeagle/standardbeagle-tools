---
name: figma-query-common-patterns
description: "Common Figma workflow patterns for design system extraction, component documentation, and asset management. Figma 常用工作流模式：設計系統提取、組件文檔、資產管理。 Use when: starting a new Figma project, implementing a component, exporting tokens, extracting icons, auditing a design system"
disable-model-invocation: true
---

# Common Figma Workflow Patterns

此技能記錄使用 figma-query 工具處理 Figma 文件之成熟模式。

## Pattern 1: Initial File Exploration

新項目起始序列：

```yaml
# Step 1: Sync file locally (enables grep/offline analysis)
sync_file:
  file_key: "ABC123xyz"
  output_dir: "./figma-export"
  assets: true

# Step 2: Get tree overview
get_tree:
  file_key: "ABC123xyz"
  depth: 3

# Step 3: List components
list_components:
  file_key: "ABC123xyz"
  include_usage: true

# Step 4: List styles
list_styles:
  file_key: "ABC123xyz"
```

## Pattern 2: Component Implementation

在代碼中實現 Figma 組件：

```yaml
# Step 1: Find the component
search:
  file_key: "ABC123xyz"
  pattern: "Button*"
  node_types: ["COMPONENT"]

# Step 2: Get wireframe for structure understanding
wireframe:
  file_key: "ABC123xyz"
  node_id: "1:234"
  annotations: ["ids", "names", "dimensions"]

# Step 3: Extract CSS
get_css:
  file_key: "ABC123xyz"
  node_ids: ["1:234"]
  style: "vanilla"  # or tailwind, styled-components

# Step 4: Get token references
get_tokens:
  file_key: "ABC123xyz"
  node_ids: ["1:234"]

# Step 5: Export assets (icons, images)
export_assets:
  file_key: "ABC123xyz"
  node_ids: ["icon-id-1", "icon-id-2"]
  formats: ["svg"]
  output_dir: "./assets"
```

## Pattern 3: Design Token Export

設計令牌全量提取：

```yaml
# Step 1: Export tokens as CSS variables
export_tokens:
  file_key: "ABC123xyz"
  output_path: "./tokens/tokens.css"
  format: "css"

# Step 2: Export as JSON for processing
export_tokens:
  file_key: "ABC123xyz"
  output_path: "./tokens/tokens.json"
  format: "json"

# Step 3: Export Tailwind config
export_tokens:
  file_key: "ABC123xyz"
  output_path: "./tailwind.tokens.js"
  format: "tailwind"
```

## Pattern 4: Icon Library Export

從設計文件提取全部圖標：

```yaml
# Step 1: Search for all icons
search:
  file_key: "ABC123xyz"
  pattern: "icon-*"
  node_types: ["COMPONENT"]

# Step 2: Export as SVG
export_assets:
  file_key: "ABC123xyz"
  node_ids: [all icon IDs from search]
  formats: ["svg"]
  output_dir: "./icons"
  naming: "name"

# Step 3: Generate icon manifest
# Use sync_file output or query results
```

## Pattern 5: Screen Documentation

文檔化所有頁面/屏幕：

```yaml
# Step 1: Get page structure
get_tree:
  file_key: "ABC123xyz"
  depth: 2

# Step 2: For each page, get detailed tree
get_tree:
  file_key: "ABC123xyz"
  node_id: "page:id"
  depth: 4

# Step 3: Export page as image
download_image:
  file_key: "ABC123xyz"
  node_ids: ["page:id"]
  format: "png"
  output_dir: "./docs/screens"

# Step 4: Generate wireframe
wireframe:
  file_key: "ABC123xyz"
  node_id: "page:id"
  annotations: ["names"]
```

## Pattern 6: Component Variant Analysis

分析組件全部變體：

```yaml
# Step 1: Find component with variants
list_components:
  file_key: "ABC123xyz"
  include_variants: true

# Step 2: Get CSS for each variant
get_css:
  file_key: "ABC123xyz"
  node_ids: [variant IDs]
  style: "vanilla"

# Step 3: Compare tokens across variants
get_tokens:
  file_key: "ABC123xyz"
  node_ids: [variant IDs]

# Step 4: Generate wireframes for documentation
# For each variant:
wireframe:
  node_id: "variant:id"
```

## Pattern 7: Design System Audit

設計系統全面審計：

```yaml
# Step 1: Full sync
sync_file:
  file_key: "ABC123xyz"
  assets: true

# Step 2: Component inventory
list_components:
  include_variants: true
  include_usage: true

# Step 3: Style inventory
list_styles: {}

# Step 4: Query for orphan nodes (no component/style)
query:
  q:
    from: ["FRAME", "RECTANGLE", "TEXT"]
    where:
      "$not":
        boundVariables: { "$exists": true }
```

## Pattern 8: Change Tracking

追蹤設計變更：

```yaml
# Step 1: Create baseline
sync_file:
  file_key: "ABC123xyz"
  output_dir: "./baseline-$(date)"

# Step 2: After changes, diff
diff:
  file_key: "ABC123xyz"
  version1: "./baseline-2024-01"
  version2: "current"

# Step 3: Analyze specific changes
get_node:
  node_id: "changed:id"
  select: ["@all"]
```

## Pattern 9: Batch Asset Export

高效批量導出所有視覺資產：

```yaml
# Step 1: Query for exportable nodes
query:
  q:
    from: ["COMPONENT", "INSTANCE", "FRAME"]
    where:
      exportSettings: { "$exists": true }
    select: ["id", "name", "exportSettings"]

# Step 2: Export in batches (50 at a time)
export_assets:
  node_ids: [batch 1]
  formats: ["png", "svg"]
  scales: [1, 2]

# Repeat for remaining batches
```

## Pattern 10: Typography System Extraction

提取完整排版系統：

```yaml
# Step 1: Get text styles
list_styles:
  style_types: ["text"]

# Step 2: Export as CSS
export_tokens:
  include: ["typography"]
  format: "css"

# Step 3: Find all text nodes using styles
query:
  q:
    from: ["TEXT"]
    select: ["@structure", "@typography"]

# Step 4: Verify consistency
```

## Best Practices

1. **先本地緩存**：大量查詢前先 `sync_file`
2. **善用投影**：只取所需字段
3. **批量操作**：同類操作打包執行
4. **邊做邊記**：善用線框圖與導出
5. **版本追蹤**：定期 diff 防止漂移
6. **驗證令牌**：核查變量用法一致性

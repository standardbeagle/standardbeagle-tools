---
name: figma-query-build-docs
description: "\"Interactive wizard to build component and page documentation site from Figma using Go templates. 交互式嚮導：以 Go 模板從 Figma 構建組件與頁面文檔站點。 Use when: building design system documentation, generating component docs site, creating figma-to-html docs, interactive docs wizard, full documentation from figma\""
disable-model-invocation: true
arguments: " - name: file_key description: Figma file key (optional - will prompt if not provided) required: false"
---

# Build Documentation Site from Figma

嚮導式構建完整文檔站點，含 HTML 模型及 SASS/CSS，源自 Figma 設計系統。

## Interactive Workflow

以 AskUserQuestion 引導用戶完成以下步驟：

### Step 1: Get Figma File

若未提供 `file_key`，詢問用戶：

```yaml
question: "What is your Figma file URL or key?"
header: "Figma File"
options:
  - label: "I'll paste the URL"
    description: "Paste the full Figma URL (e.g., figma.com/design/ABC123/...)"
  - label: "I have the file key"
    description: "Just the key part (e.g., ABC123xyz)"
```

必要時從 URL 提取 file key：
```
https://www.figma.com/design/ABC123xyz/Design-System
                            ^^^^^^^^^^^
```

### Step 2: Verify Figma Access

用 figma-query 校驗訪問：
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: info
  parameters:
    topic: status
```

若未配置，指引用戶設置令牌。

### Step 3: Choose Output Format

```yaml
question: "What CSS format do you want for your components?"
header: "CSS Format"
options:
  - label: "SCSS (Recommended)"
    description: "SASS with variables, nesting, and mixins"
  - label: "SASS"
    description: "Indented SASS syntax"
  - label: "Vanilla CSS"
    description: "Plain CSS with custom properties"
  - label: "Tailwind"
    description: "Tailwind utility classes"
```

### Step 4: Choose HTML Format

```yaml
question: "What HTML format do you want for mockups?"
header: "HTML Format"
options:
  - label: "Semantic HTML (Recommended)"
    description: "Clean, accessible HTML5 with proper elements"
  - label: "React Components"
    description: "JSX-ready component structure"
```

### Step 5: Choose Output Directory

```yaml
question: "Where should the documentation be saved?"
header: "Output Dir"
options:
  - label: "./docs (Recommended)"
    description: "Standard docs folder in project root"
  - label: "./design-system"
    description: "Dedicated design system folder"
  - label: "Custom path"
    description: "Specify a custom directory"
```

### Step 6: Sync File and Analyze

在本地同步 Figma 文件：
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: sync_file
  parameters:
    file_key: "<FILE_KEY>"
    output_dir: "./figma-export"
    assets: true
```

取文件結構：
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: get_tree
  parameters:
    file_key: "<FILE_KEY>"
    depth: 3
```

列出組件：
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: list_components
  parameters:
    file_key: "<FILE_KEY>"
    include_variants: true
```

### Step 7: Select What to Extract

呈現已發現的組件與頁面：

```yaml
question: "Which components do you want to document?"
header: "Components"
multiSelect: true
options:
  - label: "All components"
    description: "Extract all discovered components (X found)"
  - label: "Buttons only"
    description: "Button variants and states"
  - label: "Cards only"
    description: "Card components"
  - label: "Select specific"
    description: "I'll specify which ones"
```

### Step 8: Export Design Tokens

以所選格式導出令牌：
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: export_tokens
  parameters:
    file_key: "<FILE_KEY>"
    output_path: "<OUTPUT_DIR>/tokens/tokens.scss"  # or .css based on choice
    format: "scss"  # or css, tailwind based on choice
```

### Step 9: Extract Components

每個選定組件，以 Go 模板提取：

```yaml
# Get component CSS using template
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: get_css
  parameters:
    file_key: "<FILE_KEY>"
    node_ids: ["<COMPONENT_ID>"]
    style: "scss"  # Uses Go template: css/scss.tmpl
    namespace: "component-name"
    output_file: "<OUTPUT_DIR>/components/<name>/component.scss"
```

### Step 10: Export Assets

導出圖標與圖像：
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: export_assets
  parameters:
    file_key: "<FILE_KEY>"
    node_ids: ["<ICON_IDS>"]
    output_dir: "<OUTPUT_DIR>/assets"
    formats: ["svg"]
    naming: "name"
```

### Step 11: Generate HTML Mockups

HTML 模型生成有兩種選項：

**Option A: Use get_node with template rendering (if available)**
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: get_node
  parameters:
    file_key: "<FILE_KEY>"
    node_id: "<COMPONENT_ID>"
    select: ["@all"]
    depth: 3
```

再用模板數據結構生成 HTML。

**Option B: Use wireframe + CSS to build HTML**
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: wireframe
  parameters:
    file_key: "<FILE_KEY>"
    node_id: "<COMPONENT_ID>"
    annotations: ["ids", "names", "dimensions"]
```

以線框結構創建語義化 HTML，搭配已提取的 CSS 類。

### Step 12: Create Documentation Structure

創建最終文檔結構：

```
<OUTPUT_DIR>/
├── index.html              # Landing page with component gallery
├── tokens/
│   ├── tokens.scss         # Design tokens as SCSS variables
│   └── tokens.css          # CSS custom properties version
├── components/
│   ├── index.html          # Component index
│   ├── Button/
│   │   ├── index.html      # Component showcase
│   │   ├── component.scss  # Component styles
│   │   └── README.md       # Usage docs
│   └── Card/
│       └── ...
├── pages/
│   ├── index.html          # Page mockups index
│   └── Home/
│       ├── mockup.html     # Full page mockup
│       └── page.scss       # Page styles
└── assets/
    ├── icons/              # SVG icons
    └── images/             # Raster images
```

## Output Summary

結束時呈現摘要：

```
Documentation Build Complete
============================
File: ABC123xyz
Output: ./docs

Exported:
- 45 components
- 12 pages
- 156 design tokens
- 234 assets

Files created:
- docs/index.html
- docs/tokens/tokens.scss
- docs/components/index.html
- docs/components/Button/index.html
- ...

Next steps:
1. Open docs/index.html in browser
2. Review generated SCSS in docs/tokens/
3. Copy component HTML from mockups
```

## Key Principles

1. **使用 Go 模板** - figma-query MCP 以 Go text/template 實現確定性輸出
2. **非 AI 生成代碼** - CSS 與 HTML 源自模板，非 LLM 生成
3. **交互式引導** - 用 AskUserQuestion 收集偏好
4. **增量提取** - 讓用戶選擇提取範圍
5. **生產就緒輸出** - BEM 命名、SCSS 變量、語義化 HTML

---
name: complete-extraction
description: Complete design library extraction workflow with validation and dependency checking. 完整設計庫提取工作流：含驗證與依賴檢查。 Use when: extracting a full design library, running all phases in order, extracting with validation, resuming a failed extraction, automated design-to-code pipeline
---

# Complete Design Library Extraction

按依賴順序編排完整、已驗證的設計庫提取，並支持自動錯誤恢復。

## Workflow Overview

```
Phase 0: Pre-Flight Check
  ↓
Phase 1: Sync Figma File
  ↓
Phase 2: Export Design Tokens ← CRITICAL (HTML depends on this)
  ↓
Phase 3: Export Component CSS
  ↓
Phase 4: Export Assets ← CRITICAL (HTML depends on this)
  ↓
Phase 5: Generate HTML Examples
  ↓
Phase 6: Generate Documentation
  ↓
Phase 7: Final Validation
  ↓
Complete!
```

## Phase-by-Phase Execution

### Phase 0: Pre-Flight Check

**目的：** 預先驗證前置條件，防止中途失敗

**Actions:**
1. 核查 Figma 訪問（令牌、API、文件權限）
2. 驗證輸出目錄可寫
3. 統計組件與樣式數量
4. 估算提取時間與體積
5. 生成提取清單

**Success Criteria:**
- Figma API 可達
- 文件可讀
- 至少含 1 個組件或樣式
- 輸出目錄可寫

**On Failure:** STOP and provide fix commands

> Invoke the `Skill` tool with `skill: figma-query:preflight-check` — 執行飛行前檢查，驗證所有前置條件。

---

### Phase 1: Sync Figma File

**目的：** 將完整文件結構下載到本地

**Actions:**
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: sync_file
  parameters:
    file_key: "FILE_KEY"
    output_dir: "./figma-export"
    assets: true
    include_document: true
```

**Success Criteria:**
- `figma-export/` 目錄已建立
- `_meta.json` 含文件元數據
- `_index.json` 含所有節點
- `_tree.txt` 展示文件結構
- `styles/` 目錄含設計令牌

**On Failure:** 檢查網絡連接，指數退避重試

---

### Phase 2: Export Design Tokens ⚠️ CRITICAL

**目的：** 創建 HTML 示例將引用的 `tokens.css`

**Why Critical:** HTML 文件引用 `var(--color-primary)`、`var(--font-body)` 等。無此文件，CSS 變量全部未定義。

**Actions:**

1. **Export as CSS custom properties:**
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: export_tokens
  parameters:
    file_key: "FILE_KEY"
    output_path: "{OUTPUT_DIR}/tokens/tokens.css"
    format: "css"
```

2. **Export as JSON (optional but recommended):**
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: export_tokens
  parameters:
    file_key: "FILE_KEY"
    output_path: "{OUTPUT_DIR}/tokens/tokens.json"
    format: "json"
```

3. **Export for Tailwind (optional):**
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: export_tokens
  parameters:
    file_key: "FILE_KEY"
    output_path: "{OUTPUT_DIR}/tokens/tailwind.tokens.js"
    format: "tailwind"
```

**Success Criteria:**
- `tokens/tokens.css` 存在
- 文件含 `:root {` 聲明
- 至少含 10 個 CSS 自定義屬性
- 含顏色（`--color-*`）、字體（`--font-*`）、間距（`--spacing-*`）

**Validation:**
```bash
# Check file exists
test -f "{OUTPUT_DIR}/tokens/tokens.css"

# Check content
grep -q ":root" "{OUTPUT_DIR}/tokens/tokens.css"
grep -q "\--color-" "{OUTPUT_DIR}/tokens/tokens.css"
grep -q "\--font-" "{OUTPUT_DIR}/tokens/tokens.css"
```

**On Failure:**
- 若 Figma 無樣式：創建默認令牌
- 若導出失敗：重試一次，再創建最小令牌

---

### Phase 3: Export Component CSS

**目的：** 提取所有組件的精確 CSS

**Actions:**

1. **List all components:**
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: list_components
  parameters:
    file_key: "FILE_KEY"
```

2. **For each major component category** (buttons, cards, navigation, etc.):
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: get_css
  parameters:
    file_key: "FILE_KEY"
    node_ids: ["NODE_ID_1", "NODE_ID_2", ...]
    style: "vanilla"
    include: ["all"]
```

3. **Save to category files:**
- `components/css/buttons.css`
- `components/css/cards.css`
- `components/css/navigation.css`
- etc.

**Success Criteria:**
- `components/css/` 中至少 1 個 CSS 文件
- CSS 文件使用令牌（`var(--...)`）而非硬編碼值
- CSS 遵循 BEM 命名（`.component__element--modifier`）
- CSS 總行數 > 200（典型設計系統）

**On Failure:** 即使令牌未引用也提取原始 CSS（後續可修復）

---

### Phase 4: Export Assets ⚠️ CRITICAL

**目的：** 導出組件中引用的所有圖標、圖像、圖形

**Why Critical:** HTML 示例含 `<img src="../assets/logo.svg">` ——無資產則鏈接失效

**Actions:**

1. **Search for all exportable assets:**
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: search
  parameters:
    file_key: "FILE_KEY"
    pattern: "*"
    node_types: ["COMPONENT", "VECTOR", "RECTANGLE"]
    scope: ["names"]
```

2. **Filter to actual assets**：定位 "Assets"、"Icons"、"Logos" 頁面中的節點；名稱含 "Icon"、"Logo"、"Image" 的組件；可見向量與形狀

3. **Export SVG for icons/vectors:**
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: export_assets
  parameters:
    file_key: "FILE_KEY"
    node_ids: ["ICON_ID_1", "ICON_ID_2", ...]
    output_dir: "{OUTPUT_DIR}/assets/icons"
    formats: ["svg"]
    naming: "name"
```

4. **Export PNG for images:**
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: export_assets
  parameters:
    file_key: "FILE_KEY"
    node_ids: ["IMAGE_ID_1", "IMAGE_ID_2", ...]
    output_dir: "{OUTPUT_DIR}/assets/images"
    formats: ["png"]
    scales: [1, 2]
    naming: "name"
```

**Success Criteria:**
- `assets/` 目錄非空
- 至少導出 1 個 SVG 或 PNG 文件
- 文件大小合理（每文件 < 1MB）
- 導出資產與組件引用匹配

**Validation:**
```bash
# Check directory not empty
test -n "$(ls -A {OUTPUT_DIR}/assets)"

# Count exported files
find {OUTPUT_DIR}/assets -type f | wc -l
```

**On Failure:**
- 記錄警告但繼續
- 標注資產需手動導出
- 提供查找資產的搜索命令

---

### Phase 5: Generate HTML Examples

**目的：** 使用提取的 CSS 與資產創建可運行的 HTML 模型

**Dependencies:**
- ✅ Phase 2 complete (tokens.css exists)
- ✅ Phase 3 complete (component CSS exists)
- ✅ Phase 4 complete (assets exported)

**Actions:**

1. **Create base HTML template:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Component Showcase</title>

  <!-- Design Tokens -->
  <link rel="stylesheet" href="../tokens/tokens.css">

  <!-- Component CSS -->
  <link rel="stylesheet" href="../components/css/buttons.css">
  <link rel="stylesheet" href="../components/css/cards.css">
  <!-- ... more as needed ... -->
</head>
<body>
  <!-- Component examples here -->
</body>
</html>
```

2. **Generate component showcase:** 創建 `examples/component-showcase.html`，展示所有按鈕變體、卡片類型、調色板、排版比例

3. **Generate page examples:** 創建 `examples/homepage-example.html`，使用實際提取組件，演示響應式佈局，含懸停交互

**Success Criteria:**
- `examples/` 中至少 1 個 HTML 文件
- 所有 CSS `<link>` 引用指向存在的文件
- 所有 `<img>` 引用指向存在的文件
- HTML 通過基本驗證（無未閉合標籤）

**Validation:**
```bash
# Check all CSS links resolve
for css in $(grep -o 'href="[^"]*\.css"' {OUTPUT_DIR}/examples/*.html | sed 's/href="//;s/"//'); do
  test -f "{OUTPUT_DIR}/examples/$css" || echo "Missing: $css"
done

# Check all image sources resolve
for img in $(grep -o 'src="[^"]*\.(svg|png|jpg)"' {OUTPUT_DIR}/examples/*.html | sed 's/src="//;s/"//'); do
  test -f "{OUTPUT_DIR}/examples/$img" || echo "Missing: $img"
done
```

**On Failure:** 生成無圖像的基本示例，在 README 中標注問題

---

### Phase 6: Generate Documentation

**目的：** 為提取庫創建完整文檔

**Actions:**

1. **Create main README:**
```markdown
# [Design System Name] - Design Library

Extracted from Figma on [DATE]

## Quick Start
1. Import the CSS
2. Use design tokens
3. Copy HTML examples

## Contents
- Design Tokens: [tokens/](./tokens/)
- Components: [components/](./components/)
- Examples: [examples/](./examples/)
- Assets: [assets/](./assets/)

## Design Tokens
[List of available tokens with examples]

## Components
[List of all extracted components]

## Examples
[Links to HTML mockups]
```

2. **Create component index:** 列出所有組件及描述，含 CSS 類名、CSS 文件鏈接、使用示例

3. **Create token documentation:** 文檔化所有顏色、排版、間距令牌，含使用示例

**Success Criteria:**
- `README.md` 存在且 > 50 行
- 組件索引列出所有提取組件
- 令牌文檔覆蓋所有類別
- 示例鏈接有效

---

### Phase 7: Final Validation ⚠️ CRITICAL

**目的：** 聲明成功前驗證提取完整且正確

**Actions:**
```
Run the validate-extraction skill with:
- output_dir: Where we extracted to
- file_key: Original Figma file
```

**What Gets Validated:**
1. 目錄結構完整
2. tokens.css 存在且有效
3. 組件 CSS 文件存在
4. assets 目錄已填充
5. HTML 示例無斷鏈
6. 文檔完整

**Success Criteria:**
- 零個關鍵錯誤
- 警告可接受（已記錄）
- 所有依賴已解析
- 可在瀏覽器中成功打開 HTML 示例

**On Failure:**
- 針對每個錯誤執行自動修復
- 重新運行驗證
- 若仍失敗，生成詳細錯誤報告

> Invoke the `Skill` tool with `skill: figma-query:validate-extraction` — 執行最終驗證，核查提取完整性與正確性。

---

## Error Recovery

### Automatic Recovery

以下錯誤自動重試：
- 網絡超時（退避重試）
- 速率限制（等待後重試）
- Figma API 瞬時錯誤（重試一次）

### Manual Fix Required

以下錯誤停止並提供修復命令：
- 訪問令牌無效 → 運行 `/setup-figma`
- 文件未找到 → 核查 file_key
- 權限拒絕 → 在 Figma 中申請訪問
- 磁盤已滿 → 釋放空間

### Partial Recovery

以下問題帶警告繼續：
- 未找到資產 → 記錄警告，繼續
- 部分組件失敗 → 跳過，繼續其他
- 令牌導出失敗 → 創建默認令牌，繼續

## Checkpoints and Resume

每階段後保存狀態：
```json
{
  "file_key": "lnwVxZrQ6pqvArfEr1EiXt",
  "output_dir": "./docs",
  "started_at": "2026-01-14T10:00:00Z",
  "phases": {
    "preflight": {"status": "complete", "completed_at": "2026-01-14T10:00:30Z"},
    "sync": {"status": "complete", "completed_at": "2026-01-14T10:02:00Z"},
    "tokens": {"status": "complete", "completed_at": "2026-01-14T10:02:30Z"},
    "css": {"status": "in_progress", "started_at": "2026-01-14T10:02:31Z"},
    "assets": {"status": "pending"},
    "html": {"status": "pending"},
    "docs": {"status": "pending"},
    "validation": {"status": "pending"}
  }
}
```

恢復失敗提取：
```
/complete-extraction --resume-from="{OUTPUT_DIR}/.extraction-state.json"
```

## Success Output

```
✓ EXTRACTION COMPLETE!

File: lnwVxZrQ6pqvArfEr1EiXt (HAAM website redesign [2025-13])
Output: ./docs

Summary:
├─ Design Tokens: 156 tokens exported
│  └─ tokens/tokens.css (5.7 KB)
├─ Components: 62 components, 3 CSS files
│  ├─ components/css/buttons.css (348 lines)
│  ├─ components/css/header.css (464 lines)
│  └─ components/css/cards.css (523 lines)
├─ Assets: 45 files exported
│  ├─ assets/icons/ (23 SVG files)
│  └─ assets/images/ (22 PNG files)
├─ Examples: 2 HTML mockups
│  ├─ examples/homepage-example.html (446 lines)
│  └─ examples/component-showcase.html (455 lines)
└─ Documentation: Complete
   ├─ README.md (399 lines)
   ├─ COMPONENTS-INDEX.md (283 lines)
   └─ QUICK-START.md (224 lines)

Validation: ✓ PASSED (0 errors, 0 warnings)

Next Steps:
1. Open examples/component-showcase.html in a browser
2. Read README.md for usage instructions
3. Import tokens/tokens.css in your project
4. Copy HTML from examples/ to your codebase

Total time: 5 minutes 23 seconds
Total size: 87.3 MB
```

## Usage

此技能由 `/extract-library` 命令調用，參數：
```yaml
file_key: "FILE_KEY"
output_dir: "./docs"
options:
  validate: true
  resume: false
  auto_fix: true
```

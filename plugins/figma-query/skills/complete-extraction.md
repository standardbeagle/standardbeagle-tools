---
name: complete-extraction
description: Complete design library extraction workflow with validation and dependency checking
---

# Complete Design Library Extraction

Orchestrates a complete, validated design library extraction from Figma with automatic dependency resolution and error recovery.

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

**Purpose:** Prevent failures by validating prerequisites

**Actions:**
1. Check Figma access (token, API, file permissions)
2. Verify output directory is writable
3. Count components and styles
4. Estimate extraction time and size
5. Generate extraction checklist

**Success Criteria:**
- Figma API accessible
- File readable
- At least 1 component or style found
- Output directory writable

**On Failure:** STOP and provide fix commands

**Skill to use:** `preflight-check`

---

### Phase 1: Sync Figma File

**Purpose:** Download complete file structure locally

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
- `figma-export/` directory created
- `_meta.json` exists with file metadata
- `_index.json` contains all nodes
- `_tree.txt` shows file structure
- `styles/` directory contains design tokens

**On Failure:** Check network connectivity, retry with exponential backoff

---

### Phase 2: Export Design Tokens ⚠️ CRITICAL

**Purpose:** Create `tokens.css` that HTML examples will reference

**Why Critical:** HTML files reference `var(--color-primary)`, `var(--font-body)`, etc. Without this file, CSS variables are undefined.

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
- `tokens/tokens.css` exists
- File contains `:root {` declaration
- File contains at least 10 CSS custom properties
- Variables include colors (`--color-*`), fonts (`--font-*`), spacing (`--spacing-*`)

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
- If no styles in Figma: Create default tokens
- If export fails: Retry once, then create minimal tokens

---

### Phase 3: Export Component CSS

**Purpose:** Extract exact CSS for all components

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
- At least 1 CSS file in `components/css/`
- CSS files use tokens (`var(--...)`) not hardcoded values
- CSS follows BEM naming (`.component__element--modifier`)
- Total CSS lines > 200 (for typical design systems)

**On Failure:** Extract raw CSS even if tokens aren't referenced (can fix later)

---

### Phase 4: Export Assets ⚠️ CRITICAL

**Purpose:** Export all icons, images, and graphics referenced in components

**Why Critical:** HTML examples have `<img src="../assets/logo.svg">` - broken without assets

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

2. **Filter to actual assets** (logos, icons, illustrations):
- Look for nodes in "Assets", "Icons", "Logos" pages
- Look for components with "Icon", "Logo", "Image" in name
- Look for vectors and shapes that are visible

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
- `assets/` directory is NOT empty
- At least 1 SVG or PNG file exported
- File sizes are reasonable (< 1MB per file)
- Exported assets match component references

**Validation:**
```bash
# Check directory not empty
test -n "$(ls -A {OUTPUT_DIR}/assets)"

# Count exported files
find {OUTPUT_DIR}/assets -type f | wc -l
```

**On Failure:**
- Log warning but continue
- Document that assets need manual export
- Provide search commands to find assets

---

### Phase 5: Generate HTML Examples

**Purpose:** Create working HTML mockups using extracted CSS and assets

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

2. **Generate component showcase:**
- Create `examples/component-showcase.html`
- Show all button variants
- Show all card types
- Show color palette
- Show typography scale

3. **Generate page examples:**
- Create `examples/homepage-example.html`
- Use actual extracted components
- Demonstrate responsive layouts
- Include interactions (hover states)

**Success Criteria:**
- At least 1 HTML file in `examples/`
- All CSS `<link>` references resolve to existing files
- All `<img>` references resolve to existing files
- HTML passes basic validation (no unclosed tags)

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

**On Failure:** Generate basic examples without images, note issues in README

---

### Phase 6: Generate Documentation

**Purpose:** Create comprehensive documentation for the extracted library

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

2. **Create component index:**
- List all components with descriptions
- Show CSS class names
- Link to CSS files
- Show usage examples

3. **Create token documentation:**
- Document all color tokens
- Document all typography tokens
- Document all spacing tokens
- Show usage examples

**Success Criteria:**
- `README.md` exists and has > 50 lines
- Component index lists all extracted components
- Token documentation covers all categories
- Links to examples work

---

### Phase 7: Final Validation ⚠️ CRITICAL

**Purpose:** Verify extraction is complete and correct before declaring success

**Actions:**
```
Run the validate-extraction skill with:
- output_dir: Where we extracted to
- file_key: Original Figma file
```

**What Gets Validated:**
1. Directory structure complete
2. tokens.css exists and valid
3. Component CSS files present
4. Assets directory populated
5. HTML examples have no broken links
6. Documentation complete

**Success Criteria:**
- Zero critical errors
- Warnings are acceptable (logged)
- All dependencies resolved
- Can open HTML examples in browser successfully

**On Failure:**
- Run auto-fix for each error
- Re-run validation
- If still failing, generate detailed error report

**Skill to use:** `validate-extraction`

---

## Error Recovery

### Automatic Recovery

For these errors, automatically retry:
- Network timeout (retry with backoff)
- Rate limit (wait and retry)
- Transient Figma API errors (retry once)

### Manual Fix Required

For these errors, stop and provide fix commands:
- Invalid access token → Run `/setup-figma`
- File not found → Check file_key
- Permission denied → Request access in Figma
- Disk full → Free up space

### Partial Recovery

For these issues, continue with warnings:
- No assets found → Log warning, continue
- Some components fail → Skip, continue with others
- Token export fails → Create default tokens, continue

## Checkpoints and Resume

Save state after each phase:
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

To resume a failed extraction:
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

This skill should be invoked by the `/extract-library` command with:
```yaml
file_key: "FILE_KEY"
output_dir: "./docs"
options:
  validate: true
  resume: false
  auto_fix: true
```

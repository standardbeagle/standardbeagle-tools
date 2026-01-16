---
name: extract-library
description: Extract a complete design library from Figma with CSS, assets, HTML mockups, and documentation using adversarial quality verification
arguments:
  - name: file_key
    description: Figma file key (from URL)
    required: true
  - name: output_dir
    description: Output directory (default: ./design-library)
    required: false
---

# Extract Design Library

Extract a complete, production-ready design library from a Figma file using the adversarial extraction loop.

## What This Creates

A full design library with:
- **Exact Figma CSS** - Pixel-perfect style extraction
- **Original Assets** - All icons, images, and graphics
- **HTML Mockups** - Implementation-ready HTML/CSS
- **Design Tokens** - CSS variables, JSON, Tailwind config
- **Documentation** - Component and page documentation

## Usage

```
/extract-library <file_key> [output_dir]
```

## Getting the File Key

From a Figma URL:
```
https://www.figma.com/design/ABC123xyz/My-Design-System
                            ^^^^^^^^^^^
                            This is the file_key
```

## Extraction Process

This command uses the **complete-extraction** skill which runs a validated, dependency-aware extraction workflow:

### Phase 0: Pre-Flight Check ⚠️
**CRITICAL:** Validates prerequisites before starting
- Check Figma access (token, API, permissions)
- Verify file has components/styles
- Confirm output directory is writable
- Estimate extraction time and size

**Skill:** `preflight-check`

### Phase 1: Sync File
- Download complete Figma file structure locally
- Create `figma-export/` directory with all nodes
- Extract metadata, components, and styles

### Phase 2: Export Design Tokens ⚠️ CRITICAL
**CRITICAL:** HTML examples depend on tokens.css existing
- Export `tokens/tokens.css` with CSS custom properties
- Export `tokens/tokens.json` (optional)
- Export `tokens/tailwind.tokens.js` (optional)

**Without this phase:** HTML will have undefined CSS variables

### Phase 3: Component CSS Extraction
For each component category:
- Extract exact Figma CSS
- Save to category files (buttons.css, cards.css, etc.)
- Use design tokens (not hardcoded values)
- Follow BEM naming convention

### Phase 4: Asset Export ⚠️ CRITICAL
**CRITICAL:** HTML examples reference these assets
- Search for all exportable assets (icons, images, logos)
- Export SVG for vectors/icons
- Export PNG (1x, 2x) for images
- Save to `assets/` directory

**Without this phase:** HTML will have broken image links

### Phase 5: HTML Example Generation
**Dependencies:** Phases 2, 3, 4 must complete first
- Create component showcase HTML
- Create page example HTML
- Link to tokens.css and component CSS
- Reference exported assets
- Validate all links resolve

### Phase 6: Documentation Generation
- Create main README with getting started guide
- Create component index
- Document design tokens
- Document usage examples

### Phase 7: Final Validation ⚠️
**CRITICAL:** Verify extraction is complete and correct
- Check directory structure
- Validate tokens.css exists and is valid
- Verify assets directory is populated
- Check HTML has no broken links
- Ensure documentation is complete

**Skill:** `validate-extraction`

**Auto-fix:** If validation fails, automatically fix common issues

## Output Structure

```
design-library/
├── README.md                    # Getting started guide
├── COMPONENTS.md               # Component index
├── PAGES.md                    # Page index
├── manifest.json               # Library manifest
├── index.css                   # Master CSS import
│
├── tokens/
│   ├── tokens.css              # CSS custom properties
│   ├── tokens.json             # JSON format
│   └── tailwind.config.js      # Tailwind integration
│
├── components/
│   ├── index.css               # All component CSS
│   ├── Button/
│   │   ├── README.md           # Component docs
│   │   ├── component.css       # Extracted CSS
│   │   ├── tokens.json         # Token usage
│   │   ├── wireframe.txt       # Structure
│   │   ├── preview.png         # Visual preview
│   │   ├── mockup.html         # HTML implementation
│   │   └── assets/             # Component assets
│   ├── Card/
│   └── ...
│
├── pages/
│   ├── index.css               # All page CSS
│   ├── Home/
│   │   ├── README.md           # Page docs
│   │   ├── page.css            # Page CSS
│   │   ├── layout.css          # Layout CSS
│   │   ├── preview.png         # Page preview
│   │   ├── mockup.html         # HTML mockup
│   │   └── sections/           # Section details
│   └── ...
│
└── assets/
    ├── icons/                  # All exported icons
    └── images/                 # All exported images
```

## Quality Guarantees

The adversarial loop ensures:

### CSS Accuracy
- Every Figma property extracted
- Values match exactly
- Design tokens used (no hardcoded values)

### Asset Completeness
- All icons exported (SVG)
- All images exported (PNG, multiple scales)
- No broken references

### Documentation
- Every component documented
- Every page documented
- Working examples included

### HTML Mockups
- Semantic HTML structure
- BEM naming convention
- Accessible markup
- No inline styles

## Example Output

After extraction:

```
Extraction Summary
==================
File: ABC123xyz
Components: 45 extracted
Pages: 12 extracted
Tokens: 156 exported
Assets: 234 exported
Issues Found: 3
Issues Fixed: 3
Warnings: 2

Output: ./design-library/
```

## Using the Library

### Import CSS
```html
<link rel="stylesheet" href="./design-library/index.css">
```

### Use Tokens
```css
.my-button {
  background: var(--color-primary-500);
  padding: var(--spacing-4);
}
```

### Copy Components
Open any `mockup.html` to see implementation-ready HTML.

## Troubleshooting

### Extraction Stops
- Check Figma access token is valid
- Check file permissions (can you view in Figma?)
- Check rate limits (wait and retry)

### Missing Components
- Verify components are published in Figma
- Check component permissions

### CSS Differences
- Run adversarial verification again
- Check for Figma features not supported (e.g., variables in expressions)

### ⚠️ CRITICAL: Missing tokens.css
**Problem:** HTML files reference `var(--color-primary)` but `tokens/tokens.css` doesn't exist

**Cause:** Phase 2 (token export) was skipped or failed

**Fix:**
```bash
# Export tokens manually
figma-query export_tokens \
  file_key="YOUR_FILE_KEY" \
  output_path="./docs/tokens/tokens.css" \
  format="css"
```

**Prevention:** Always run complete extraction workflow, don't skip phases

### ⚠️ CRITICAL: Empty assets/ Directory
**Problem:** HTML files reference `<img src="../assets/logo.svg">` but assets/ is empty

**Cause:** Phase 4 (asset export) was skipped or failed

**Fix:**
```bash
# First, find assets to export
figma-query search \
  file_key="YOUR_FILE_KEY" \
  pattern="*logo*"

# Then export them
figma-query export_assets \
  file_key="YOUR_FILE_KEY" \
  node_ids=["NODE_ID_1", "NODE_ID_2"] \
  output_dir="./docs/assets" \
  formats=["svg", "png"]
```

**Prevention:** Always run complete extraction workflow, validate after each phase

### HTML Examples Have Broken Links
**Problem:** Opening HTML shows missing CSS or images

**Cause:** Phases completed out of order or incompletely

**Fix:**
```bash
# Run validation to see what's missing
Use validate-extraction skill with:
  output_dir: "./docs"
  file_key: "YOUR_FILE_KEY"

# It will provide specific fix commands for each issue
```

### How to Verify Extraction is Complete

After extraction, check these files exist:
```bash
# Critical files that MUST exist:
docs/tokens/tokens.css           # Design tokens
docs/components/css/*.css         # At least 1 CSS file
docs/assets/*                     # At least 1 asset file
docs/examples/*.html              # At least 1 HTML file
docs/README.md                    # Documentation

# Validation command:
ls -lh docs/tokens/tokens.css
ls -lh docs/components/css/
ls -lh docs/assets/
ls -lh docs/examples/
```

### Incomplete Extraction - How to Resume

If extraction stops mid-way:
```bash
# Check extraction state
cat docs/.extraction-state.json

# Resume from last checkpoint
/extract-library --resume-from="./docs/.extraction-state.json"
```

## Next Steps

After extraction:
1. Review the `README.md` in the output directory
2. Browse `COMPONENTS.md` for component inventory
3. Copy HTML from mockups to your codebase
4. Import `index.css` for all styles

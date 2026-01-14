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

This command spawns the **library-extractor** agent which runs the adversarial extraction loop:

### Phase 1: Analysis
- Sync Figma file locally
- Analyze file structure
- List all components and variants
- List all styles
- Create extraction queue

### Phase 2: Token Extraction
- Export CSS custom properties
- Export JSON tokens
- Export Tailwind config

### Phase 3: Component Extraction
For each component:
- Extract structure (wireframe)
- Extract CSS
- Export assets (icons, images)
- Get token references
- Generate HTML mockup
- Create documentation
- Adversarial verification

### Phase 4: Page Extraction
For each page:
- Analyze section structure
- Extract layout CSS
- Document component usage
- Generate page HTML mockup
- Create documentation

### Phase 5: Library Assembly
- Create library manifest
- Generate master CSS
- Create component/page indexes
- Generate getting started guide

### Phase 6: Final Verification
- Full adversarial verification
- CSS accuracy check
- Asset completeness check
- Documentation completeness

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

## Next Steps

After extraction:
1. Review the `README.md` in the output directory
2. Browse `COMPONENTS.md` for component inventory
3. Copy HTML from mockups to your codebase
4. Import `index.css` for all styles

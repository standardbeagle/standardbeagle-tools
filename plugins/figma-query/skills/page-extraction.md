---
name: page-extraction
description: Extract a complete page/screen with all components, assets, and documentation
---

# Page/Screen Extraction

This skill extracts everything needed to implement a complete Figma page or screen.

## Page vs Component Extraction

| Aspect | Component | Page |
|--------|-----------|------|
| Scope | Single reusable element | Full screen layout |
| Hierarchy | Flat or shallow | Deep with sections |
| Components | Is a component | Uses many components |
| Layout | Self-contained | Grid/layout system |
| Documentation | Component spec | Screen spec + flow |

## Extraction Process

### Phase 1: Page Discovery

Identify the page and its structure:

```yaml
# Get file tree to find pages
get_tree:
  file_key: "FILE_KEY"
  depth: 2

# Get specific page structure
get_tree:
  file_key: "FILE_KEY"
  node_id: "PAGE_ID"
  depth: 4
```

### Phase 2: Section Analysis

Break page into logical sections:

```yaml
# Query for top-level frames (sections)
query:
  file_key: "FILE_KEY"
  q:
    from: ["#PAGE_ID > FRAME"]
    select: ["@structure", "@bounds"]

# Get wireframe for each section
wireframe:
  file_key: "FILE_KEY"
  node_id: "SECTION_ID"
  annotations: ["ids", "names", "dimensions"]
```

### Phase 3: Component Identification

Find all component instances:

```yaml
# Query for component instances
query:
  file_key: "FILE_KEY"
  q:
    from: ["#PAGE_ID > INSTANCE"]
    select: ["@structure", "componentId"]

# Get component references
list_components:
  file_key: "FILE_KEY"
  include_usage: true
```

### Phase 4: Layout Extraction

Extract layout/grid information:

```yaml
# Get page-level layout
get_node:
  file_key: "FILE_KEY"
  node_id: "PAGE_ID"
  select: ["@layout"]

# Get section layouts
get_css:
  file_key: "FILE_KEY"
  node_ids: ["SECTION_IDS..."]
  style: "vanilla"
  include: ["layout", "spacing"]
```

### Phase 5: Content Extraction

Extract text and images:

```yaml
# Query all text nodes
query:
  file_key: "FILE_KEY"
  q:
    from: ["#PAGE_ID > TEXT"]
    select: ["@structure", "characters"]

# Find all images
query:
  file_key: "FILE_KEY"
  q:
    from: ["#PAGE_ID"]
    select: ["@images"]
```

### Phase 6: Asset Export

Export page visuals:

```yaml
# Full page render
download_image:
  file_key: "FILE_KEY"
  node_ids: ["PAGE_ID"]
  format: "png"
  output_dir: "./docs/pages"

# Section renders
download_image:
  file_key: "FILE_KEY"
  node_ids: ["SECTION_IDS..."]
  format: "png"
```

## Output Structure

```
pages/PageName/
├── README.md              # Page documentation
├── page.css               # Full page CSS
├── layout.css             # Layout/grid CSS
├── preview.png            # Full page render
├── wireframe.txt          # ASCII structure
├── mockup.html            # HTML mockup
├── sections/
│   ├── header/
│   │   ├── section.css
│   │   ├── preview.png
│   │   └── mockup.html
│   ├── hero/
│   │   └── ...
│   └── footer/
│       └── ...
└── assets/
    ├── hero-bg.png
    └── icons/
```

## Documentation Template

```markdown
# PageName Screen

## Overview
[Page description and purpose]

## Preview
![Page Preview](./preview.png)

## Structure
\`\`\`
[Wireframe output showing sections]
\`\`\`

## Sections

### Header
![Header](./sections/header/preview.png)
- Navigation links
- Logo
- User menu

### Hero
![Hero](./sections/hero/preview.png)
- Headline
- Subheadline
- CTA buttons

### Content
[...]

## Components Used
| Component | Count | Location |
|-----------|-------|----------|
| Button/Primary | 3 | Hero, Footer |
| Card | 6 | Content grid |
| NavLink | 5 | Header |

## Layout
- **Grid**: 12-column, 24px gutter
- **Max width**: 1280px
- **Breakpoints**: 768px, 1024px, 1280px

## CSS
\`\`\`css
[Page layout CSS]
\`\`\`

## HTML Mockup
\`\`\`html
[Full page HTML]
\`\`\`

## Responsive Notes
[Breakpoint-specific changes]
```

## HTML Mockup Generation

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PageName</title>
  <link rel="stylesheet" href="./page.css">
</head>
<body>
  <header class="header">
    <!-- Header section -->
  </header>

  <main>
    <section class="hero">
      <!-- Hero section -->
    </section>

    <section class="content">
      <!-- Content section -->
    </section>
  </main>

  <footer class="footer">
    <!-- Footer section -->
  </footer>
</body>
</html>
```

## Section Extraction Pattern

For each section:

```yaml
# 1. Get section structure
wireframe:
  node_id: "SECTION_ID"
  annotations: ["ids", "names"]

# 2. Get section CSS
get_css:
  node_ids: ["SECTION_ID", "CHILD_IDS..."]

# 3. Get section tokens
get_tokens:
  node_ids: ["SECTION_ID", "CHILD_IDS..."]

# 4. Export section preview
download_image:
  node_ids: ["SECTION_ID"]

# 5. Document section
# Generate README.md with details
```

## Integration with Design Library Loop

Pages are processed after components:

1. Components extracted first (for reference)
2. Each page identifies component usage
3. Sections extracted with component refs
4. Full page assembled from sections

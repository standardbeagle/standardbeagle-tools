---
name: extract-pages
description: Interactively extract page mockups from Figma with SCSS/CSS layouts
arguments:
  - name: file_key
    description: Figma file key
    required: true
  - name: output_dir
    description: Output directory (default: ./pages)
    required: false
---

# Extract Pages from Figma

Extract full page mockups with section layouts, SCSS, and semantic HTML.

## Workflow

### Step 1: Get File Structure

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: get_tree
  parameters:
    file_key: "<FILE_KEY>"
    depth: 2
```

This shows all pages and their top-level frames (page designs).

### Step 2: List Pages for Selection

Present pages to user:

```yaml
question: "Which pages do you want to extract?"
header: "Pages"
multiSelect: true
options:
  - label: "All pages"
    description: "Extract all N pages found"
  - label: "Homepage"
    description: "Main landing page"
  - label: "About"
    description: "About page"
  - label: "Contact"
    description: "Contact page"
```

### Step 3: Choose Layout Approach

```yaml
question: "How should layouts be extracted?"
header: "Layout CSS"
options:
  - label: "CSS Grid (Recommended)"
    description: "Modern grid-based layouts"
  - label: "Flexbox"
    description: "Flexible box layouts"
  - label: "Both"
    description: "Grid for page, flexbox for sections"
```

### Step 4: Extract Tokens

Ensure design tokens are available:

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: export_tokens
  parameters:
    file_key: "<FILE_KEY>"
    output_path: "<OUTPUT_DIR>/tokens/_tokens.scss"
    format: "scss"
```

### Step 5: Extract Each Page

For each selected page:

#### 5a. Get Page Structure

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: wireframe
  parameters:
    file_key: "<FILE_KEY>"
    node_id: "<PAGE_FRAME_ID>"
    annotations: ["ids", "names", "dimensions", "spacing"]
    depth: 3
```

#### 5b. Identify Sections

Query for section frames within the page:

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: query
  parameters:
    file_key: "<FILE_KEY>"
    q:
      from: ["#<PAGE_FRAME_ID> > FRAME"]
      select: ["@structure", "@bounds", "@layout"]
      depth: 1
```

#### 5c. Extract Layout CSS

Get the page layout CSS:

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: get_css
  parameters:
    file_key: "<FILE_KEY>"
    node_ids: ["<PAGE_FRAME_ID>"]
    style: "scss"
    include: ["layout", "spacing"]
    namespace: "<page-name>"
    output_file: "<OUTPUT_DIR>/<PageName>/_layout.scss"
```

#### 5d. Extract Section CSS

For each section, get its styles:

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: get_css
  parameters:
    file_key: "<FILE_KEY>"
    node_ids: ["<SECTION_IDS>"]
    style: "scss"
    namespace: "<page-name>"
    output_file: "<OUTPUT_DIR>/<PageName>/_sections.scss"
    append: true
```

#### 5e. Export Page Assets

Export images and icons used on the page:

```yaml
# Find images in the page
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: query
  parameters:
    file_key: "<FILE_KEY>"
    q:
      from: ["#<PAGE_FRAME_ID>"]
      select: ["@images"]
      depth: -1

# Export the images
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: download_image
  parameters:
    file_key: "<FILE_KEY>"
    image_refs: ["<IMAGE_REFS>"]
    output_dir: "<OUTPUT_DIR>/<PageName>/assets"
```

#### 5f. Generate Page Preview

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: download_image
  parameters:
    file_key: "<FILE_KEY>"
    node_ids: ["<PAGE_FRAME_ID>"]
    output_dir: "<OUTPUT_DIR>/<PageName>"
    format: "png"
    scale: 1
```

### Step 6: Generate Page HTML Mockup

Build the HTML mockup from extracted data.

Page HTML structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ PageName }}</title>
  <link rel="stylesheet" href="../tokens/_tokens.css">
  <link rel="stylesheet" href="./_layout.css">
  <link rel="stylesheet" href="./_sections.css">
</head>
<body class="page page--{{ page-slug }}">
  <header class="header">
    <!-- Header section from Figma -->
  </header>

  <main>
    <section class="hero" aria-labelledby="hero-title">
      <!-- Hero section content -->
    </section>

    <section class="features">
      <!-- Features section content -->
    </section>

    <!-- Additional sections -->
  </main>

  <footer class="footer">
    <!-- Footer section -->
  </footer>
</body>
</html>
```

### Step 7: Create Page Index

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Page Mockups</title>
  <link rel="stylesheet" href="./tokens/_tokens.css">
  <style>
    .page-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem; }
    .page-card { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
    .page-card img { width: 100%; height: auto; }
    .page-card h2 { padding: 1rem; margin: 0; font-size: 1.125rem; }
  </style>
</head>
<body>
  <h1>Page Mockups</h1>
  <div class="page-grid">
    {{- range .Pages }}
    <article class="page-card">
      <a href="./{{ .Slug }}/mockup.html">
        <img src="./{{ .Slug }}/preview.png" alt="{{ .Name }} preview">
        <h2>{{ .Name }}</h2>
      </a>
    </article>
    {{- end }}
  </div>
</body>
</html>
```

## Output Structure

```
<output_dir>/
├── index.html              # Page gallery
├── tokens/
│   ├── _tokens.scss
│   └── _tokens.css
├── Homepage/
│   ├── mockup.html         # Full page HTML mockup
│   ├── _layout.scss        # Page layout CSS
│   ├── _sections.scss      # Section styles
│   ├── preview.png         # Page preview image
│   └── assets/
│       ├── hero-image.png
│       └── logo.svg
├── About/
│   └── ...
└── Contact/
    └── ...
```

## Section Detection

The extraction automatically identifies common section patterns:

| Figma Name Pattern | HTML Element | CSS Class |
|-------------------|--------------|-----------|
| Header, Nav, Navigation | `<header>` | `.header` |
| Hero, Banner | `<section>` | `.hero` |
| Features, Benefits | `<section>` | `.features` |
| About, Story | `<section>` | `.about` |
| Testimonials, Reviews | `<section>` | `.testimonials` |
| CTA, Call to Action | `<section>` | `.cta` |
| Footer | `<footer>` | `.footer` |

## Summary Output

```
Page Extraction Complete
========================
File: ABC123xyz
Output: ./pages

Extracted 5 pages:
- Homepage (7 sections)
- About (4 sections)
- Services (5 sections)
- Contact (3 sections)
- Blog (4 sections)

Files created:
- pages/index.html
- pages/tokens/_tokens.scss
- pages/Homepage/mockup.html
- pages/Homepage/_layout.scss
- pages/Homepage/_sections.scss
- ...

Assets exported: 47 images, 23 icons

Usage:
1. Open pages/index.html in browser
2. Click any page to view full mockup
3. Copy HTML sections to your codebase
4. Import SCSS: @use 'pages/Homepage/layout';
```

## Responsive Considerations

Ask user about responsive breakpoints:

```yaml
question: "Does the Figma file have responsive variants?"
header: "Responsive"
options:
  - label: "Yes - extract all breakpoints"
    description: "Desktop, tablet, mobile variants"
  - label: "Desktop only"
    description: "Just extract desktop layout"
  - label: "I'll handle responsive myself"
    description: "Generate desktop CSS, I'll add media queries"
```

If responsive variants exist, extract each and generate media queries:

```scss
// _layout.scss
.page {
  // Desktop (default)
  display: grid;
  grid-template-columns: 1fr minmax(0, 1200px) 1fr;

  @media (max-width: 768px) {
    // Tablet styles from Figma tablet variant
    grid-template-columns: 1fr;
    padding: 0 24px;
  }

  @media (max-width: 480px) {
    // Mobile styles from Figma mobile variant
    padding: 0 16px;
  }
}
```

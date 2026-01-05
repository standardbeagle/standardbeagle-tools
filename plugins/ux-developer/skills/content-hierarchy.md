---
name: content-hierarchy
description: Visual hierarchy and content structure principles for scannable, accessible layouts
---

# Content Hierarchy

Create clear visual hierarchy that guides users through content effectively.

## Hierarchy Principles

1. **Important first** - Key information at top and left
2. **Progressive disclosure** - Details on demand
3. **Scannable structure** - Headers, lists, short paragraphs
4. **Visual weight** - Size, color, contrast signal importance
5. **Semantic structure** - HTML reflects visual hierarchy

## Heading Hierarchy

### Semantic Structure

```html
<!-- Correct: Sequential heading levels -->
<h1>Page Title</h1>
  <h2>Main Section</h2>
    <h3>Subsection</h3>
    <h3>Subsection</h3>
  <h2>Another Section</h2>
    <h3>Subsection</h3>
      <h4>Detail</h4>

<!-- Wrong: Skipped levels -->
<h1>Title</h1>
  <h4>Subsection</h4>  <!-- Skipped h2, h3 -->
```

### Visual Styling

```css
/* Typography scale for hierarchy */
h1 {
  font-size: 2.5rem;    /* 40px */
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

h2 {
  font-size: 2rem;      /* 32px */
  font-weight: 600;
  line-height: 1.3;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
}

h3 {
  font-size: 1.5rem;    /* 24px */
  font-weight: 600;
  line-height: 1.4;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}

h4 {
  font-size: 1.25rem;   /* 20px */
  font-weight: 500;
  line-height: 1.4;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}
```

### One H1 Per Page

```html
<!-- Page should have single h1 -->
<main>
  <h1>Product Catalog</h1>

  <!-- Use h2 for page sections -->
  <section>
    <h2>Featured Products</h2>
    <!-- Product cards use h3 -->
  </section>

  <section>
    <h2>All Products</h2>
  </section>
</main>
```

## Visual Weight

### Size Hierarchy

```css
/* Larger = more important */
.hero-title { font-size: 3rem; }
.section-title { font-size: 2rem; }
.card-title { font-size: 1.25rem; }
.meta-text { font-size: 0.875rem; }
```

### Color and Contrast

```css
/* Higher contrast = more important */
.primary-text { color: #111; }     /* High contrast */
.secondary-text { color: #444; }   /* Medium contrast */
.tertiary-text { color: #666; }    /* Lower contrast */
.muted-text { color: #888; }       /* Subtle */

/* Accent color for emphasis */
.highlight { color: #0066cc; }
```

### Weight and Style

```css
/* Bold = more important */
.emphasis-strong { font-weight: 700; }
.emphasis-medium { font-weight: 500; }
.emphasis-normal { font-weight: 400; }

/* Combined hierarchy signals */
.primary-action {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background: #0066cc;
}

.secondary-action {
  font-size: 0.875rem;
  font-weight: 500;
  color: #0066cc;
  background: transparent;
}
```

## Content Patterns

### Inverted Pyramid

Most important information first, details follow.

```html
<article>
  <!-- Lead: Most important info -->
  <p class="lead">
    Company announces 50% increase in quarterly revenue,
    exceeding analyst expectations.
  </p>

  <!-- Supporting details -->
  <p>The growth was driven by...</p>

  <!-- Background/context -->
  <p>The company has been...</p>
</article>
```

### Scannable Content

```html
<!-- Break up long content -->
<article>
  <h2>How to Improve Page Performance</h2>

  <!-- Summary/TL;DR -->
  <p class="summary">
    Optimize images, minimize JavaScript, and leverage caching.
  </p>

  <!-- Scannable sections -->
  <section>
    <h3>1. Optimize Images</h3>
    <ul>
      <li>Use WebP format</li>
      <li>Implement lazy loading</li>
      <li>Serve responsive sizes</li>
    </ul>
  </section>

  <section>
    <h3>2. Minimize JavaScript</h3>
    <!-- Short paragraphs, lists, code blocks -->
  </section>
</article>
```

### Card Hierarchy

```html
<article class="card">
  <!-- Visual (optional) -->
  <img src="thumbnail.jpg" alt="">

  <!-- Category/meta (small, muted) -->
  <p class="card-category">Technology</p>

  <!-- Title (prominent) -->
  <h3 class="card-title">Article Title Here</h3>

  <!-- Description (secondary) -->
  <p class="card-description">
    Brief description of the content...
  </p>

  <!-- Meta info (smallest) -->
  <footer class="card-meta">
    <span>5 min read</span>
    <span>Jan 4, 2026</span>
  </footer>
</article>
```

```css
.card-category {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #666;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0.5rem 0;
}

.card-description {
  font-size: 0.875rem;
  color: #444;
}

.card-meta {
  font-size: 0.75rem;
  color: #888;
}
```

## Spacing for Hierarchy

### Vertical Rhythm

```css
/* Consistent spacing scale */
:root {
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-2xl: 3rem;     /* 48px */
}

/* More space above = new section */
h2 {
  margin-top: var(--space-2xl);
  margin-bottom: var(--space-md);
}

/* Less space = related content */
h3 {
  margin-top: var(--space-xl);
  margin-bottom: var(--space-sm);
}

p {
  margin-bottom: var(--space-md);
}
```

### Grouping Related Items

```css
/* Tight spacing within group */
.field-group > * + * {
  margin-top: var(--space-sm);
}

/* More space between groups */
.field-group + .field-group {
  margin-top: var(--space-xl);
}
```

## Accessibility

### Heading Navigation

Screen reader users navigate by headings. Ensure:

```html
<!-- Descriptive headings -->
<h2>Shipping Options</h2>  <!-- Good -->
<h2>Section 3</h2>         <!-- Bad -->

<!-- Complete hierarchy -->
<h1>Order Confirmation</h1>
  <h2>Order Summary</h2>
  <h2>Shipping Details</h2>
  <h2>Payment Information</h2>

<!-- Hidden headings for structure -->
<h2 class="sr-only">Search Results</h2>
```

### Visual vs Semantic

```html
<!-- Visual appearance can differ from semantic level -->
<h2 class="h3-style">This is semantically h2</h2>
```

```css
/* Style classes separate from semantic elements */
.h1-style { font-size: 2.5rem; }
.h2-style { font-size: 2rem; }
.h3-style { font-size: 1.5rem; }
```

### Landmark Regions

```html
<header>
  <h1>Site Name</h1>
  <nav aria-label="Main">...</nav>
</header>

<main>
  <h1>Page Title</h1>  <!-- Visible page heading -->

  <section aria-labelledby="section1">
    <h2 id="section1">First Section</h2>
  </section>

  <section aria-labelledby="section2">
    <h2 id="section2">Second Section</h2>
  </section>
</main>

<aside>
  <h2>Related Content</h2>
</aside>

<footer>...</footer>
```

## Hierarchy Checklist

- [ ] Single h1 per page
- [ ] Heading levels not skipped
- [ ] Visual hierarchy matches semantic hierarchy
- [ ] Most important content first/prominent
- [ ] Consistent spacing scale
- [ ] Scannable with headings, lists, short paragraphs
- [ ] Color contrast supports hierarchy
- [ ] Headings are descriptive (not "Click here", "Section 1")

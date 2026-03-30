---
name: current-page
description: Get comprehensive information about the current page the user is browsing - URL, content, navigation, links, structured data, performance, and visual state
---

# Current Page Information Skill

This skill provides comprehensive page information extraction using agnt's browser integration. Use this to understand what the user is currently viewing in their browser.

## Prerequisites

A proxy must be running and the browser connected:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "start",
    "id": "dev",
    "target_url": "http://localhost:3000"
  }
}
```

---

## Quick Overview: Get All Page Info

**First, check for errors:**

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_errors",
  "parameters": {"proxy_id": "dev", "include_warnings": false}
}
```

Then get page context:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "({ url: window.location.href, title: document.title, viewport: { width: window.innerWidth, height: window.innerHeight, scrollX: window.scrollX, scrollY: window.scrollY } })"
  }
}
```

---

## Page Basics

### URL and Title

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "({ href: window.location.href, origin: window.location.origin, pathname: window.location.pathname, title: document.title })"
  }
}
```

Returns: Full URL, origin, path, and page title.

### Viewport and Scroll Position

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "({ viewport: { width: window.innerWidth, height: window.innerHeight, devicePixelRatio: window.devicePixelRatio }, scroll: { x: window.scrollX, y: window.scrollY, maxScrollX: document.documentElement.scrollWidth - window.innerWidth, maxScrollY: document.documentElement.scrollHeight - window.innerHeight } })"
  }
}
```

---

## Content Extraction

### Page Content as Markdown

Extract main content formatted as markdown:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_content.extractContent()"
  }
}
```

**Options:**
- `selector` - CSS selector for content area (auto-detected if not provided)
- `includeImages` - Include image references (default: true)
- `includeLinks` - Include link URLs (default: true)
- `maxLength` - Maximum content length (default: 50000)

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_content.extractContent({ selector: 'article', maxLength: 10000 })"
  }
}
```

Returns:
- `url` - Page URL
- `title` - Page title
- `markdown` - Content as markdown
- `meta` - Meta description, keywords, author, OpenGraph
- `headings` - Heading hierarchy (level, text, id)
- `wordCount` - Approximate word count
- `truncated` - Whether content was truncated

### Heading Hierarchy

Get document outline structure:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_content.extractHeadings()"
  }
}
```

Returns: Array of `{ level, text, id }` for all h1-h6 elements.

### Meta Tags

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "({ description: document.querySelector('meta[name=\"description\"]')?.content, keywords: document.querySelector('meta[name=\"keywords\"]')?.content, author: document.querySelector('meta[name=\"author\"]')?.content, viewport: document.querySelector('meta[name=\"viewport\"]')?.content, charset: document.characterSet, lang: document.documentElement.lang })"
  }
}
```

---

## Navigation Structure

### Extract Full Navigation

Get all navigation elements, breadcrumbs, header/footer nav:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_content.extractNavigation()"
  }
}
```

Returns:
- `navElements` - All `<nav>` elements with nested structure
- `header` - Header navigation links
- `footer` - Footer navigation links
- `breadcrumbs` - Breadcrumb trail if present
- `sidebar` - Sidebar navigation if present

### Breadcrumbs

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_content.extractNavigation().breadcrumbs"
  }
}
```

---

## Links

### All Links with Context

Extract and categorize all links:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_content.extractLinks()"
  }
}
```

Returns:
- `internal` - Links to same origin
- `external` - Links to other domains
- `anchors` - Same-page anchor links
- `mailto` - Email links
- `tel` - Phone links
- `stats` - Counts by category

Each link includes: `href`, `url`, `text`, `title`, `ariaLabel`, `selector`, `inNav`, `inFooter`, `inHeader`, `rel`.

### Filter Links

Only internal links:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_content.extractLinks({ internal: true })"
  }
}
```

Include anchor links, scoped to a section:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_content.extractLinks({ includeAnchors: true, selector: '.sidebar' })"
  }
}
```

---

## Structured Data

### JSON-LD, OpenGraph, Twitter Cards

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_content.extractStructuredData()"
  }
}
```

Returns:
- `jsonLd` - Parsed JSON-LD structured data
- `openGraph` - All `og:*` meta tags
- `twitter` - All `twitter:*` meta tags

### OpenGraph Only

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_content.extractStructuredData().openGraph"
  }
}
```

---

## Performance Metrics

Performance metrics are automatically captured by agnt. Check the proxy logs:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxylog",
  "parameters": {
    "proxy_id": "dev",
    "types": ["performance"]
  }
}
```

### Manual Performance Check

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "(function() { var perf = window.performance; var timing = perf && perf.timing; if (!timing) return { error: 'Performance timing not available' }; return { navigationStart: timing.navigationStart, domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart, loadComplete: timing.loadEventEnd - timing.navigationStart, domInteractive: timing.domInteractive - timing.navigationStart, domComplete: timing.domComplete - timing.navigationStart }; })()"
  }
}
```

Returns: Navigation timing metrics in milliseconds.

### Paint Timing (FCP, FP)

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "(function() { var entries = performance.getEntriesByType('paint'); var result = {}; entries.forEach(function(e) { result[e.name] = Math.round(e.startTime); }); return result; })()"
  }
}
```

---

## DOM Statistics

### Document Size

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "({ elementCount: document.querySelectorAll('*').length, bodyHTML: document.body.innerHTML.length, depth: (function maxDepth(el, d) { if (!el.children.length) return d; return Math.max(...Array.from(el.children).map(c => maxDepth(c, d + 1))); })(document.body, 0) })"
  }
}
```

Returns: Total elements, HTML size in bytes, max DOM depth.

### Forms and Inputs

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "({ forms: document.forms.length, inputs: document.querySelectorAll('input, textarea, select').length, buttons: document.querySelectorAll('button').length })"
  }
}
```

---

## Visual State

### Screenshot

Take a screenshot of the current page:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "await __devtool.screenshot('current-page')"
  }
}
```

**Options:**
- `fullPage: true` - Capture entire scrollable page
- `selector: '.content'` - Capture specific element
- `region: {x, y, width, height}` - Capture pixel region

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "await __devtool.screenshot({ name: 'full-page', fullPage: true })"
  }
}
```

### Wireframe

Generate structural wireframe:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.generateWireframe({ viewportOnly: true })"
  }
}
```

---

## Complete Page Snapshot

Get everything at once:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "({ basics: { url: window.location.href, title: document.title, viewport: { width: window.innerWidth, height: window.innerHeight } }, meta: { description: document.querySelector('meta[name=\"description\"]')?.content, keywords: document.querySelector('meta[name=\"keywords\"]')?.content }, headings: __devtool_content.extractHeadings().slice(0, 20), links: __devtool_content.extractLinks().stats, navigation: __devtool_content.extractNavigation().navElements.length > 0, structuredData: { jsonLd: __devtool_content.extractStructuredData().jsonLd.length, openGraph: Object.keys(__devtool_content.extractStructuredData().openGraph).length }, dom: { elements: document.querySelectorAll('*').length, forms: document.forms.length } })"
  }
}
```

---

## Quick Reference

### Content Module Functions

| Function | Purpose |
|----------|---------|
| `extractContent(opts)` | Page content as markdown |
| `extractHeadings(scope)` | Heading hierarchy |
| `extractNavigation()` | All navigation structures |
| `extractLinks(opts)` | Categorized links with context |
| `extractStructuredData()` | JSON-LD, OG, Twitter cards |
| `buildSitemap(opts)` | Site structure from internal links |

### Common Options

**extractContent:**
- `selector` - Content area selector
- `includeImages` - Include images (default: true)
- `includeLinks` - Include links (default: true)
- `maxLength` - Max length (default: 50000)

**extractLinks:**
- `internal` - Only internal links
- `external` - Only external links
- `includeAnchors` - Include anchors
- `selector` - Scope to element

### When to Use

- **"What page am I on?"** → Basic URL/title check
- **"What's on this page?"** → extractContent()
- **"Show me the navigation"** → extractNavigation()
- **"What links are here?"** → extractLinks()
- **"Is there structured data?"** → extractStructuredData()
- **"How's the page performing?"** → proxylog performance
- **"Show me what it looks like"** → screenshot()

---

## Related Skills

For debugging issues on the current page, see the **browser-debug** skill which covers:
- Element inspection
- Layout diagnostics
- Interaction tracking
- Mutation monitoring

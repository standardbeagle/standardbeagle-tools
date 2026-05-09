---
name: design-utilities-typography-overview
description: Overview of the typography MCP server tools for type system work - modular scale generation, font metrics extraction, variable font axis parsing, font subsetting to WOFF2, and system-fallback font stacks with size-adjust tuning.
disable-model-invocation: true
---

# Typography MCP Overview

The `typography` MCP server provides precise typography calculations and font file analysis for design systems and web delivery. It lives in a separate repository and is consumed here as a thin plugin wrapper.

## Proposed Tools

### `modular_scale`
Generate a ratio-based modular type scale in pixels and rems. Produces a ladder of sizes from a base, using classical ratios (minor second 1.067, major second 1.125, minor third 1.200, major third 1.250, perfect fourth 1.333, augmented fourth 1.414, perfect fifth 1.500, golden 1.618) or a custom multiplier.

Inputs: `base` (px, default 16), `ratio` (named ratio or number), `steps_up` (int), `steps_down` (int), optional `round` (px precision), `unit` (`px` | `rem` | `both`).

### `font_metrics`
Parse a font file and extract core vertical metrics: x-height, cap-height, ascender, descender, line-gap, units-per-em, and derived line-height recommendations. Supports OpenType/TrueType tables (OS/2, hhea, head) with proper em-to-ratio conversion.

Inputs: `font` (path or URL), optional `unit` (`em` | `ratio` | `px` with `size`), `recommend_line_height` (bool).

### `variable_font_axes`
Inspect a variable font and list its design-variation axes (`wght`, `wdth`, `slnt`, `opsz`, `ital`, custom). Returns axis tags, names, min/default/max, and suggested CSS `font-variation-settings` snippets plus `@font-face` declarations.

Inputs: `font` (path or URL), optional `instances` (bool - include named instances), `emit_css` (bool - include ready-to-paste CSS).

### `font_subset`
Subset a font to a target Unicode range and encode as WOFF2. Strips unused glyphs, features, and tables to minimize payload for web delivery. Supports predefined ranges (latin, latin-ext, cyrillic, greek, vietnamese) and custom ranges.

Inputs: `font` (path or URL), `unicode_range` (preset name or explicit ranges e.g. `U+0000-00FF,U+2013`), optional `features` (array of OpenType feature tags to retain), `layout` (`compress` | `preserve`), `output` (path).

### `font_stack`
Build a CSS `font-family` stack with system-font fallbacks tuned via `size-adjust`, `ascent-override`, `descent-override`, and `line-gap-override` to minimize layout shift (CLS) when the web font loads. Measures the primary font against a chosen fallback family.

Inputs: `primary` (font path/URL or family name), `fallback` (`system-ui` | `serif` | `sans-serif` | `monospace` | explicit family), optional `emit_css` (bool - include `@font-face` block), `target` (`web` | `native`).

## Setup

This plugin ships with `mcp.json.disabled` because the marketplace manages MCP servers through `slop-mcp`. To activate:

1. Publish `@standardbeagle/typography` to npm
2. Register via `slop-mcp:slop-add` (recommended) or enable the bundled mcp config out-of-band

## Installation via slop-mcp

```bash
# Register MCP server
claude mcp add standardbeagle-typography -- npx -y @standardbeagle/typography@latest mcp
```

Or via slop-mcp KDL config:

```kdl
// .slop-mcp/servers.kdl
server "standardbeagle-typography" {
    command "npx"
    args "-y" "@standardbeagle/typography@latest" "mcp"
}
```

Verify by calling `list_tools` on the registered server.

## Related

- `ux-design:typography-system` — design-time typography system planning skill
- `design-token` plugin — export typography tokens (font-family, font-size, line-height) to CSS/Tailwind/SCSS
- `color` plugin — WCAG contrast verification for text color vs background

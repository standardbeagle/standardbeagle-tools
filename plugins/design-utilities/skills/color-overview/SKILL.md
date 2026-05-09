---
name: design-utilities-color-overview
description: "Overview of color MCP server tools for precise color operations - WCAG contrast, color blindness simulation, palette extraction, color space conversion, and harmony generation."
disable-model-invocation: true
---

# Color MCP Overview

The `color` MCP server provides precise color operations for design, accessibility, and UI engineering workflows. It lives in a separate repository and is consumed here as a thin plugin wrapper.

## Proposed Tools

### `contrast_check`
Check WCAG 2.1/2.2 contrast ratios between foreground and background colors. Returns ratio plus AA/AAA pass/fail for normal text, large text, and UI components (3:1).

Inputs: `foreground` (color string), `background` (color string), optional `level` (`AA` | `AAA`), `text_size` (`normal` | `large`).

### `color_blindness_simulate`
Simulate how a color appears under common color vision deficiencies. Supports deuteranopia, protanopia, tritanopia, achromatopsia.

Inputs: `color` (string), `type` (`deuteranopia` | `protanopia` | `tritanopia` | `achromatopsia`), optional `severity` (0-1).

### `palette_extract`
Extract a dominant color palette from an image using k-means clustering. Returns ranked swatches with proportions.

Inputs: `image` (path or URL or base64), `count` (number of colors, default 5), optional `color_space` for clustering.

### `color_convert`
Convert between color spaces: HEX, RGB, HSL, LAB, OKLCH, HSV. Round-trip safe for supported spaces.

Inputs: `color` (string in any supported format), `to` (target space), optional `precision`.

### `harmony_generate`
Generate color harmonies from a base color: complementary, triadic, analogous, split-complementary, tetradic.

Inputs: `base` (color string), `scheme` (`complementary` | `triadic` | `analogous` | `split-complementary` | `tetradic`), optional `count` and `spread`.

## Setup

This plugin ships with `mcp.json.disabled` because the marketplace manages MCP servers through `slop-mcp`. To activate:

1. Publish `@standardbeagle/color` to npm
2. Register via `slop-mcp:slop-add` (recommended) or enable the bundled mcp config out-of-band

## Installation via slop-mcp

```bash
# Register MCP server
claude mcp add standardbeagle-color -- npx -y @standardbeagle/color@latest mcp
```

Or via slop-mcp KDL config:

```kdl
// .slop-mcp/servers.kdl
server "standardbeagle-color" {
    command "npx"
    args "-y" "@standardbeagle/color@latest" "mcp"
}
```

Verify by calling `list_tools` on the registered server.

## Related

- `ux-design` plugin — color theory, palette design guidance
- `ux-developer` plugin — accessibility workflows, WCAG verification
- `agnt:audit-a11y` — browser-based accessibility audit (complementary)

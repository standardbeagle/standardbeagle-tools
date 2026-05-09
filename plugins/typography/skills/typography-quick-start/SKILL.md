---
name: typography-quick-start
description: Quick reference for the typography MCP server - modular_scale, font_metrics, variable_font_axes, font_subset, font_stack. Use when building a type scale, analyzing font vertical metrics for line-height decisions, inspecting variable font axes for CSS, subsetting fonts to WOFF2 for web delivery, or tuning system-font fallback stacks with size-adjust to avoid CLS.
---

# Typography MCP Quick Start

Use the `typography` MCP server for type calculations and font file analysis. Complementary to `design-token` (export typography tokens) and `ux-design:typography-system` (planning).

## When to Use

- Generating a modular type scale from a base size and ratio
- Extracting font metrics (x-height, cap-height, ascender, descender) to choose line-heights
- Inspecting a variable font's axes (`wght`/`wdth`/`slnt`) and emitting ready-to-paste CSS
- Subsetting a font to Latin or a custom Unicode range and encoding as WOFF2 for web delivery
- Building a `font-family` stack with `size-adjust`-tuned fallbacks to minimize CLS on web-font load

## Tool Map

| Task | Tool |
| --- | --- |
| Generate ratio-based type scale | `modular_scale` |
| Extract font vertical metrics | `font_metrics` |
| List variable font axes + CSS | `variable_font_axes` |
| Subset font to Unicode range (WOFF2) | `font_subset` |
| Build CSS font stack with fallback tuning | `font_stack` |

## Typical Workflows

1. **New type scale**: run `modular_scale` with `base: 16`, `ratio: 1.25` (major third), `steps_up: 6`, `steps_down: 2`, emit both `px` and `rem`; feed sizes into `design-token:tokens_generate` for the type category.
2. **Line-height tuning**: run `font_metrics` on a candidate body font to read x-height and derived line-height recommendations, then apply them to the type scale before export.
3. **Variable font adoption**: run `variable_font_axes` with `emit_css: true` to get `@font-face` + `font-variation-settings` snippets for each weight/width variant needed.
4. **Web delivery**: run `font_subset` with a latin range and retained `kern,liga` features to produce a WOFF2 payload small enough to self-host without CDN.
5. **Anti-CLS fallback**: run `font_stack` with the primary web font and `fallback: system-ui` to emit a `@font-face` block with `size-adjust`, `ascent-override`, and `descent-override` tuned so the fallback renders at near-identical metrics.

## Notes

- The MCP server is a separate package (`@standardbeagle/typography`); this plugin is only the Claude Code integration wrapper.
- Register the server through `slop-mcp` per this project's conventions; the bundled `mcp.json.disabled` is intentional.
- Font analysis supports OpenType/TrueType containers; variable font axis handling follows the OpenType 1.8 fvar/STAT spec.
- Subsetting and WOFF2 encoding assume a licence that permits modification and redistribution of the font file - verify before shipping.
- Pair with `design-token` to emit the type scale as design tokens for CSS/Tailwind/SCSS consumers.

---
name: design-utilities-color-quick-start
description: "Quick reference for color MCP server - contrast_check, color_blindness_simulate, palette_extract, color_convert, harmony_generate. Use when working on accessibility verification, palette design, color space conversion, or generating harmonious color schemes."
disable-model-invocation: true
---

# Color MCP Quick Start

Use the `color` MCP server for precise, deterministic color operations rather than asking the model to estimate values.

## When to Use

- Verifying WCAG contrast before committing a UI change
- Simulating color blindness to check palette robustness
- Extracting a dominant palette from a reference image or brand asset
- Converting between HEX, RGB, HSL, LAB, OKLCH, HSV without floating-point drift
- Generating color harmonies for theming or branding

## Tool Map

| Task | Tool |
| --- | --- |
| WCAG AA/AAA check | `contrast_check` |
| CVD preview | `color_blindness_simulate` |
| Image → palette | `palette_extract` |
| Format conversion | `color_convert` |
| Theme scheme | `harmony_generate` |

## Typical Workflows

1. **Palette audit**: `palette_extract` on the hero image, then `contrast_check` each swatch against the planned text color, then `color_blindness_simulate` for the final set.
2. **Theme generation**: pick a brand color, `harmony_generate` with `triadic` or `split-complementary`, convert each result via `color_convert` to the target CSS format (e.g., `oklch`).
3. **Accessibility fix**: when `contrast_check` fails, iterate by nudging lightness in `oklch` via `color_convert`, re-check.

## Notes

- The MCP server is a separate package (`@standardbeagle/color`); this plugin is only the Claude Code integration wrapper.
- Register the server through `slop-mcp` per this project's conventions; the bundled `mcp.json.disabled` is intentional.

## Related

- `design-utilities:color-overview` — 工具全覽與 setup

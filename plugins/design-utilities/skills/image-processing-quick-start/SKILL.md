---
name: design-utilities-image-processing-quick-start
description: "Quick reference for image-processing MCP — image_optimize, responsive_generate, blur_hash, svg_optimize, palette_from_image. Use when: compress/convert images to WebP/AVIF, generate responsive srcset, produce BlurHash/LQIP placeholders, minify SVG, extract dominant-color palettes."
disable-model-invocation: true
---

# Image Processing MCP Quick Start

Use the `image-processing` MCP server for raster and vector image pipelines - optimization, responsive variants, placeholders, SVG minification, and palette extraction. Complementary to `color` (color operations) and `design-token` (token export).

## When to Use

- Compressing PNG/JPG to WebP or AVIF and stripping metadata for web delivery
- Generating responsive image sets with a `<img srcset>` snippet across breakpoints
- Producing BlurHash strings and/or base64 LQIP data URIs for lazy-loaded hero images
- Minifying SVG icons and illustrations with SVGO (default, aggressive, or conservative preset)
- Extracting a dominant-color palette from source imagery for branding or theming decisions

## Tool Map

| Task | Tool |
| --- | --- |
| Optimize/convert raster image | `image_optimize` |
| Generate responsive variants + srcset | `responsive_generate` |
| Generate BlurHash or LQIP placeholder | `blur_hash` |
| Minify SVG via SVGO | `svg_optimize` |
| Extract dominant-color palette | `palette_from_image` |

## Typical Workflows

1. **Hero image pipeline**: run `image_optimize` with `format: avif`, `quality: 70` to shrink the master; then `responsive_generate` at widths `[640, 960, 1280, 1920]` with `formats: ["avif", "webp"]`; finally `blur_hash` with `mode: both` to get the BlurHash string and an inline LQIP data URI for the `<img>` placeholder.
2. **Icon set cleanup**: run `svg_optimize` with `preset: aggressive`, `multipass: true`, `keep_viewbox: true` over each icon to strip editor metadata and collapse paths before checking into the repo.
3. **Brand palette from photo**: run `palette_from_image` with `colors: 6`, `algorithm: kmeans`, `sort: frequency` to get dominant colors with share percentages; feed the HEX codes into `color:contrast` for WCAG checks and `design-token:tokens_generate` to emit as color tokens.
4. **Content image fan-out**: run `image_optimize` on source PNGs/JPGs once; then `responsive_generate` with density variants (1x/2x) for retina and breakpoint widths for responsive layouts - emit HTML to paste directly into templates.
5. **Article thumbnail placeholder**: run `blur_hash` with `mode: blurhash`, `components_x: 4`, `components_y: 3` to get a ~30-char BlurHash stored in the article frontmatter for progressive-loading list views.

## Notes

- The MCP server is a separate package (`@standardbeagle/image-processing`); this plugin is only the Claude Code integration wrapper.
- Register the server through `slop-mcp` per this project's conventions; the bundled `mcp.json.disabled` is intentional.
- Raster operations assume a Node backend using `sharp` (libvips); SVG optimization wraps `svgo`; BlurHash follows the woltapp/blurhash reference encoder.
- AVIF encoding is CPU-expensive - use `effort: 4` for fast previews and `effort: 9` for final output.
- Pair palette extraction with `color` plugin tools to validate WCAG contrast and simulate color blindness before committing brand colors.
- Pair responsive/optimization output with `a11y-audit` to verify `alt` attributes and contrast on text overlays.

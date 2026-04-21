---
name: image-processing-overview
description: Overview of the image-processing MCP server tools for image pipelines - lossy/lossless optimization and format conversion, responsive srcset generation, BlurHash/LQIP placeholder creation, SVG optimization via SVGO, and dominant-color palette extraction.
---

# Image Processing MCP Overview

The `image-processing` MCP server provides raster and vector image pipeline operations for performant web delivery. It lives in a separate repository and is consumed here as a thin plugin wrapper.

## Proposed Tools

### `image_optimize`
Compress and optionally convert raster images between PNG, JPG, WebP, and AVIF. Supports lossy and lossless modes with per-format quality controls and automatic format selection by content type (photo vs graphic).

Inputs: `input` (path or URL), `output` (path), optional `format` (`png` | `jpg` | `webp` | `avif` | `auto`), `quality` (1-100, default 80), `lossless` (bool), `strip_metadata` (bool, default true), `effort` (1-10 encoder effort for WebP/AVIF).

### `responsive_generate`
Generate a set of responsive variants for a source image and emit an HTML `srcset` snippet. Produces width-scaled versions at specified breakpoints with optional format fan-out (WebP/AVIF alongside the original format).

Inputs: `input` (path or URL), `output_dir` (path), `widths` (array of px, e.g. `[320, 640, 960, 1280, 1920]`), optional `formats` (array, default `["webp", "original"]`), `quality` (1-100), `density` (bool - include 1x/2x density variants), `emit_html` (bool - include `<img srcset>` markup).

### `blur_hash`
Generate a BlurHash string and/or base64-encoded LQIP (low-quality image placeholder) for lazy-loading hero images. BlurHash produces a compact ~30-char string decoded to a blurred preview; LQIP emits a tiny inline-able data URI.

Inputs: `input` (path or URL), optional `mode` (`blurhash` | `lqip` | `both`, default `both`), `components_x` (1-9, default 4), `components_y` (1-9, default 3), `lqip_width` (px, default 32), `lqip_format` (`webp` | `jpg`).

### `svg_optimize`
Wrap SVGO to minify and clean SVG markup - strip comments, metadata, hidden elements, convert shapes to paths, and merge paths. Configurable plugin preset for aggressive vs conservative passes.

Inputs: `input` (path, URL, or inline SVG string), `output` (path, optional), optional `preset` (`default` | `aggressive` | `conservative`), `multipass` (bool, default true), `pretty` (bool - preserve readability), `keep_viewbox` (bool, default true), `plugins` (array of SVGO plugin overrides).

### `palette_from_image`
Extract the dominant color palette from an image with per-color percentage breakdown. Uses k-means or median-cut quantization over a downsampled sample. Emits HEX/RGB with share percentages, optionally sorted by luminance or frequency.

Inputs: `input` (path or URL), optional `colors` (2-16, default 5), `algorithm` (`kmeans` | `median_cut`, default `kmeans`), `sort` (`frequency` | `luminance` | `hue`), `exclude_transparent` (bool, default true), `sample_size` (max px sampled, default 10000).

## Setup

This plugin ships with `mcp.json.disabled` because the marketplace manages MCP servers through `slop-mcp`. To activate:

1. Publish `@standardbeagle/image-processing` to npm
2. Register via `slop-mcp:slop-add` (recommended) or enable the bundled mcp config out-of-band

## Related

- `color` plugin — deeper color operations on the palette extracted here (contrast, blindness simulation, conversion)
- `design-token` plugin — emit brand palette colors (from `palette_from_image`) as design tokens
- `typography` plugin — pair with image optimization for complete web-delivery payload shrinkage
- `a11y-audit` plugin — verify `<img>` alt text and contrast of text overlaid on images

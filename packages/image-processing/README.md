# @standardbeagle/image-processing

Sharp-backed raster image ops (resize, crop, format-convert, optimize, watermark, sprite, responsive-srcset, BlurHash, palette extraction, lazy-loading analysis) plus SVG optimization via SVGO. MCP server + library.

## Install

```bash
npm install @standardbeagle/image-processing

# or use via MCP:
npx -y @standardbeagle/image-processing@latest mcp
```

All file paths are absolute filesystem paths.

## Tools

### image_resize

Resize an image to specified dimensions.

**Input:**

```ts
{
  input: string,
  output: string,
  width?: number,
  height?: number,
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside',
  withoutEnlargement?: boolean,
}
```

**Output:**

```ts
{ output: string, width: number, height: number, bytes: number }
```

**Example:**

```ts
await callTool('image_resize', {
  input: '/abs/in.jpg',
  output: '/abs/out.jpg',
  width: 800,
  fit: 'inside',
});
```

### image_crop

Crop a rectangular region from an image.

**Input:**

```ts
{
  input: string,
  output: string,
  left: number,
  top: number,
  width: number,
  height: number,
}
```

**Output:**

```ts
{ output: string, width: number, height: number, bytes: number }
```

**Example:**

```ts
await callTool('image_crop', {
  input: '/abs/in.jpg', output: '/abs/out.jpg',
  left: 100, top: 100, width: 400, height: 300,
});
```

### image_format_convert

Convert an image to a different format.

**Input:**

```ts
{
  input: string,
  output: string,
  format: 'jpeg' | 'png' | 'webp' | 'avif' | 'gif',
  quality?: number,    // 1..100
}
```

**Output:**

```ts
{ output: string, format: string, bytes: number }
```

**Example:**

```ts
await callTool('image_format_convert', {
  input: '/abs/in.png', output: '/abs/out.webp', format: 'webp', quality: 85,
});
```

### image_optimize

Optimize an image for the web; re-encodes to the target format with the requested quality, optionally stripping metadata, and reports byte reduction.

**Input:**

```ts
{
  input_path: string,
  output_path: string,
  format?: 'png' | 'jpg' | 'webp' | 'avif',  // inferred from output_path if omitted
  quality?: number,                          // 1..100, default 80
  strip_metadata?: boolean,                  // default true
}
```

**Output:**

```ts
{
  output_path: string,
  bytes_in: number,
  bytes_out: number,
  reduction_pct: number,
}
```

**Example:**

```ts
await callTool('image_optimize', {
  input_path: '/abs/in.jpg',
  output_path: '/abs/out.webp',
  quality: 75,
});
```

### image_metadata_extract

Extract metadata (EXIF, ICC, dimensions, color depth) from an image file.

**Input:**

```ts
{ input: string }
```

**Output:**

```ts
{
  format: string,
  width: number,
  height: number,
  channels: number,
  hasAlpha: boolean,
  exif?: Record<string, unknown>,
  icc?: Record<string, unknown>,
}
```

**Example:**

```ts
await callTool('image_metadata_extract', { input: '/abs/photo.jpg' });
```

### image_watermark

Add a text watermark to an image.

**Input:**

```ts
{
  input: string,
  output: string,
  text: string,
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center',
  fontSize?: number,
  color?: string,
  opacity?: number,        // 0..1
}
```

**Output:**

```ts
{ output: string, bytes: number }
```

**Example:**

```ts
await callTool('image_watermark', {
  input: '/abs/in.jpg', output: '/abs/wm.jpg',
  text: '© 2026', position: 'bottom-right', opacity: 0.5,
});
```

### sprite_generate

Generate a CSS sprite sheet from multiple images plus the matching CSS.

**Input:**

```ts
{
  images: string[],
  output: string,
  cssClassPrefix?: string,
}
```

**Output:**

```ts
{
  output: string,
  width: number,
  height: number,
  css: string,
  positions: Array<{ image: string, x: number, y: number, width: number, height: number }>,
}
```

**Example:**

```ts
await callTool('sprite_generate', {
  images: ['/abs/icon-a.png', '/abs/icon-b.png'],
  output: '/abs/sprite.png',
  cssClassPrefix: 'icon',
});
```

### image_lazy_analysis

Analyze a list of images for lazy-loading suitability (above/below the fold heuristics, dimension thresholds, decoder cost).

**Input:**

```ts
{ images: string[] }
```

**Output:**

```ts
{
  results: Array<{
    image: string,
    recommend_lazy: boolean,
    reasons: string[],
  }>,
}
```

**Example:**

```ts
await callTool('image_lazy_analysis', {
  images: ['/abs/hero.jpg', '/abs/footer-art.jpg'],
});
```

### responsive_generate

Generate responsive image variants at multiple breakpoints; emits an HTML5 `srcset` string and a `sizes` hint. Skips breakpoints wider than the source (no upscaling).

**Input:**

```ts
{
  input_path: string,
  output_dir: string,
  breakpoints?: number[],            // default [320,640,960,1280,1920]
  format?: 'webp' | 'avif' | 'jpg',  // default 'webp'
  quality?: number,                  // 1..100, default 80
}
```

**Output:**

```ts
{
  variants: Array<{ width: number, path: string, bytes: number }>,
  srcset: string,
  sizes_hint: string,
}
```

**Example:**

```ts
await callTool('responsive_generate', {
  input_path: '/abs/hero.jpg',
  output_dir: '/abs/out',
  breakpoints: [640, 1280, 1920],
});
```

### blur_hash

Compute a BlurHash string and optional low-quality image placeholder (LQIP) JPEG data URI from a source image. Useful for image placeholder UX while full assets load.

**Input:**

```ts
{
  input_path: string,
  components_x?: number,    // 1..9, default 4
  components_y?: number,    // 1..9, default 3
  include_lqip?: boolean,   // default true
}
```

**Output:**

```ts
{
  blurhash: string,
  width: number,
  height: number,
  lqip_base64?: string,     // 32px-wide JPEG data URI
}
```

**Example:**

```ts
await callTool('blur_hash', { input_path: '/abs/photo.jpg' });
```

### palette_from_image

Extract a dominant-color palette from an image via k-means clustering on a sub-sampled pixel set. Output shape matches `color.palette_extract`; semantic overlap is intentional — this is the image-processing MCP surface for the same algorithm.

**Input:**

```ts
{
  input_path: string,
  count?: number,           // 2..16, default 5
  sample_pixels?: number,   // 100..100000, default 10000
}
```

**Output:**

```ts
{
  colors: Array<{ hex: string, rgb: { r: number, g: number, b: number }, weight: number }>,
  count: number,
  sampled_pixels: number,
}
```

**Example:**

```ts
await callTool('palette_from_image', {
  input_path: '/abs/photo.jpg',
  count: 5,
});
```

### svg_optimize

Optimize an SVG with SVGO v3+. Accepts inline `svg` or `svg_path`; supports `aggressive` mode (preset-default with `cleanupIds.force` and `removeDimensions` overrides) and `symbol_sprite` mode (wraps the optimized SVG in `<svg style="display:none"><symbol id="..." viewBox="...">` for icon-sprite usage). Writes to `output_path` when provided and reports byte reduction.

**Input:**

```ts
{
  svg?: string,             // inline source
  svg_path?: string,        // OR absolute path; one is required
  output_path?: string,
  aggressive?: boolean,     // default false
  symbol_sprite?: boolean,  // default false
}
```

**Output:**

```ts
{
  svg: string,              // optimized output (always returned)
  output_path?: string,
  bytes_in: number,
  bytes_out: number,
  reduction_pct: number,
}
```

**Example:**

```ts
await callTool('svg_optimize', {
  svg_path: '/abs/icon.svg',
  output_path: '/abs/icon.min.svg',
  aggressive: true,
});
```

## Direct TypeScript usage

```ts
import { imageResize }          from '@standardbeagle/image-processing/tools/image-resize.js';
import { imageCrop }            from '@standardbeagle/image-processing/tools/image-crop.js';
import { imageFormatConvert }   from '@standardbeagle/image-processing/tools/image-format-convert.js';
import { imageOptimize }        from '@standardbeagle/image-processing/tools/image-optimize.js';
import { imageMetadataExtract } from '@standardbeagle/image-processing/tools/image-metadata-extract.js';
import { imageWatermark }       from '@standardbeagle/image-processing/tools/image-watermark.js';
import { spriteGenerate }       from '@standardbeagle/image-processing/tools/sprite-generate.js';
import { imageLazyAnalysis }    from '@standardbeagle/image-processing/tools/image-lazy-analysis.js';
import { responsiveGenerate }   from '@standardbeagle/image-processing/tools/responsive-generate.js';
import { blurHash }             from '@standardbeagle/image-processing/tools/blur-hash.js';
import { paletteFromImage }     from '@standardbeagle/image-processing/tools/palette-from-image.js';
import { svgOptimize }          from '@standardbeagle/image-processing/tools/svg-optimize.js';
```

## License

MIT

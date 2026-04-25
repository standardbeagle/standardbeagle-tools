# @standardbeagle/typography

Type scales, line-height and letter-spacing math, font pairing, font-file inspection (fontkit), variable-axis introspection, harfbuzz subsetting, and CLS-minimizing fallback stacks. MCP server + library.

## Install

```bash
npm install @standardbeagle/typography

# or use via MCP:
npx -y @standardbeagle/typography@latest mcp
```

## Tools

### font_pair

Suggest font pairings based on a primary font and an optional mood/category.

**Input:**

```ts
{
  primary: string,
  mood?:    'modern' | 'classic' | 'playful' | 'serious' | 'minimal',
  category?: 'serif' | 'sans-serif' | 'display' | 'monospace',
}
```

**Output:**

```ts
{
  pairings: Array<{ secondary: string, rationale: string }>,
}
```

**Example:**

```ts
await callTool('font_pair', { primary: 'Inter', mood: 'modern' });
```

### type_scale_generate

Generate a modular type scale at a list of step indices.

**Input:**

```ts
{
  base: number,                 // px
  ratio?: number,               // default 1.25
  steps?: number[],             // default [-2,-1,0,1,2,3,4]
}
```

**Output:**

```ts
{
  base: number,
  ratio: number,
  scale: Array<{ step: number, px: number }>,
}
```

**Example:**

```ts
await callTool('type_scale_generate', { base: 16, ratio: 1.25 });
```

### readable_width

Recommend an optimal line length (in characters and px) given a font size and available content width.

**Input:**

```ts
{
  fontSize: number,                                   // px
  contentWidth?: number,                              // px
  measure?: 'narrow' | 'medium' | 'wide',
}
```

**Output:**

```ts
{
  characters: number,
  px: number,
}
```

**Example:**

```ts
await callTool('readable_width', { fontSize: 16, measure: 'medium' });
```

### line_height

Calculate an optimal line height for a given font size and column width.

**Input:**

```ts
{
  fontSize: number,
  width?: number,
  xHeight?: number,
  language?: string,
}
```

**Output:**

```ts
{ lineHeight: number }            // unitless multiplier
```

**Example:**

```ts
await callTool('line_height', { fontSize: 16, width: 640 });
```

### letter_spacing

Calculate letter-spacing for a given font size and use case.

**Input:**

```ts
{
  fontSize: number,
  useCase?: 'body' | 'heading' | 'display' | 'caption' | 'button',  // default 'body'
}
```

**Output:**

```ts
{ letterSpacingEm: number, letterSpacingPx: number }
```

**Example:**

```ts
await callTool('letter_spacing', { fontSize: 48, useCase: 'display' });
```

### modular_scale

Generate a modular type scale with `caption / small / body / h6..h1` labels in px and/or rem.

**Input:**

```ts
{
  base?: number,           // px, default 16
  ratio?: number,          // default 1.25
  steps_up?: number,       // default 6   (h6..h1)
  steps_down?: number,     // default 2   (small, caption)
  output?: 'px' | 'rem' | 'both',  // default 'both'
  root_px?: number,        // default 16, for rem conversion
  labels?: string[],       // length must equal steps_down + steps_up + 1
}
```

**Output:**

```ts
{
  steps: Array<{ label: string, px: number, rem?: number }>,
}
```

**Example:**

```ts
await callTool('modular_scale', { base: 16, ratio: 1.25 });
```

### font_metrics

Read font metrics (ascent, descent, x-height, cap-height, line-gap, units-per-em) from a font file using fontkit.

**Input:**

```ts
{ font_path: string }     // TTF, OTF, WOFF, WOFF2, or TTC
```

**Output:**

```ts
{
  family: string,
  unitsPerEm: number,
  ascent: number,
  descent: number,
  lineGap: number,
  xHeight: number,
  capHeight: number,
}
```

**Example:**

```ts
await callTool('font_metrics', { font_path: '/abs/path/Inter.ttf' });
```

### variable_font_axes

Inspect a variable font: list variation axes (`wght`, `wdth`, `slnt`, `ital`, `opsz`, custom), named instances, and emit a CSS `@font-face` + `font-variation-settings` example.

**Input:**

```ts
{ font_path: string }
```

**Output:**

```ts
{
  axes: Array<{ tag: string, name: string, min: number, default: number, max: number }>,
  instances: Array<{ name: string, coords: Record<string, number> }>,
  css_example: string,
}
```

**Example:**

```ts
await callTool('variable_font_axes', { font_path: '/abs/path/InterVariable.ttf' });
```

### font_subset

Subset a font to a set of unicode ranges using harfbuzz-wasm (via `subset-font`); writes WOFF2/WOFF/TTF output and reports byte reduction and glyph count.

**Input:**

```ts
{
  font_path: string,
  unicode_ranges?: string[],            // default ['U+0020-007F','U+00A0-00FF']
  output_path?: string,                 // defaults to os.tmpdir()
  format?: 'woff2' | 'woff' | 'ttf',    // default 'woff2'
}
```

**Output:**

```ts
{
  output_path: string,
  bytes_in: number,
  bytes_out: number,
  reduction_pct: number,
  glyphs: number,
}
```

**Example:**

```ts
await callTool('font_subset', {
  font_path: '/abs/path/Inter.ttf',
  unicode_ranges: ['U+0020-007F'],
  format: 'woff2',
});
```

### font_stack

Build a CLS-minimizing `font-family` stack for a custom font: emits an `@font-face` block with `size-adjust` + ascent/descent/line-gap overrides tuned to a system fallback, plus a ready-to-paste `font-family` declaration.

**Input:**

```ts
{
  custom_font_path: string,
  family_type?: 'sans-serif' | 'serif' | 'monospace',  // default 'sans-serif'
}
```

**Output:**

```ts
{
  font_face_css: string,        // @font-face for the fallback override
  font_family_css: string,      // 'My Font', 'My Font Fallback', sans-serif
  size_adjust_pct: number,
  ascent_override_pct: number,
  descent_override_pct: number,
  line_gap_override_pct: number,
}
```

**Example:**

```ts
await callTool('font_stack', {
  custom_font_path: '/abs/path/Inter.ttf',
  family_type: 'sans-serif',
});
```

## Direct TypeScript usage

```ts
import { fontPair }          from '@standardbeagle/typography/tools/font-pair.js';
import { typeScaleGenerate } from '@standardbeagle/typography/tools/type-scale-generate.js';
import { readableWidth }     from '@standardbeagle/typography/tools/readable-width.js';
import { lineHeight }        from '@standardbeagle/typography/tools/line-height.js';
import { letterSpacing }     from '@standardbeagle/typography/tools/letter-spacing.js';
import { modularScale }      from '@standardbeagle/typography/tools/modular-scale.js';
import { fontMetrics }       from '@standardbeagle/typography/tools/font-metrics.js';
import { variableFontAxes }  from '@standardbeagle/typography/tools/variable-font-axes.js';
import { fontSubset }        from '@standardbeagle/typography/tools/font-subset.js';
import { fontStack }         from '@standardbeagle/typography/tools/font-stack.js';
```

## License

MIT

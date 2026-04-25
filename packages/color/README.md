# @standardbeagle/color

WCAG contrast checking, color-harmony generation, color-vision-deficiency simulation, and image palette extraction. MCP server + library.

## Install

```bash
npm install @standardbeagle/color

# or use via MCP:
npx -y @standardbeagle/color@latest mcp
```

## Tools

### contrast_check

Calculate the WCAG 2.x contrast ratio between two colors and check it against AA/AAA thresholds.

**Input:**

```ts
{
  foreground: string,                       // hex or rgb
  background: string,                       // hex or rgb
  target?: 'AA' | 'AAA',                    // default 'AA'
  text_size?: 'normal' | 'large',           // default 'normal'
}
```

**Output:**

```ts
{
  ratio: number,            // e.g. 4.54
  passes: boolean,          // passes target at text_size
  required: number,         // required ratio for the chosen target/size
}
```

**Example:**

```ts
const result = await callTool('contrast_check', {
  foreground: '#000000',
  background: '#ffffff',
  target: 'AA',
});
// { ratio: 21, passes: true, required: 4.5 }
```

### harmony_generate

Generate a color harmony palette from a base color.

**Input:**

```ts
{
  base: string,                             // hex
  scheme: 'complementary' | 'triadic' | 'analogous'
        | 'split-complementary' | 'tetradic' | 'monochromatic',
  count?: number,                           // for monochromatic / analogous
}
```

**Output:**

```ts
{
  scheme: string,
  base: string,
  colors: string[],         // hex strings, includes base
}
```

**Example:**

```ts
const result = await callTool('harmony_generate', {
  base: '#0066cc',
  scheme: 'triadic',
});
// { scheme: 'triadic', base: '#0066cc', colors: ['#0066cc', '#cc0066', '#66cc00'] }
```

### color_blindness_simulate

Simulate deuteranopia / protanopia / tritanopia on one color or a palette.

**Input:**

```ts
{
  colors: string | string[],
  type?: 'deuteranopia' | 'protanopia' | 'tritanopia' | 'all', // default 'all'
  severity?: number,                                            // 0..1, default 1
}
```

**Output:**

```ts
{
  results: Array<{
    original: string,
    simulations: {
      deuteranopia?: string,
      protanopia?: string,
      tritanopia?: string,
    },
  }>,
}
```

**Example:**

```ts
const result = await callTool('color_blindness_simulate', {
  colors: ['#ff0000', '#00ff00'],
  type: 'deuteranopia',
});
```

### palette_extract

Extract a dominant-color palette from an image using k-means clustering on a sub-sampled pixel set.

**Input:**

```ts
{
  image: string,           // absolute filesystem path
  k?: number,              // 2..16, default 5
  sample_pixels?: number,  // 100..100000, default 10000
}
```

**Output:**

```ts
{
  colors: Array<{
    hex: string,
    rgb: { r: number, g: number, b: number },
    weight: number,        // share of clustered pixels
  }>,
  k: number,
  sampled_pixels: number,
}
```

**Example:**

```ts
const result = await callTool('palette_extract', {
  image: '/abs/path/to/photo.jpg',
  k: 5,
});
```

Same algorithm as `image-processing.palette_from_image`; the duplication is intentional so that callers using only one MCP can get a palette without pulling in the other surface.

## Direct TypeScript usage

Each tool's pure handler is exported and can be called without going through MCP:

```ts
import { contrastCheck } from '@standardbeagle/color/tools/contrast-check.js';
import { generateHarmony } from '@standardbeagle/color/tools/harmony-generate.js';
import { colorBlindness } from '@standardbeagle/color/tools/color-blindness.js';
import { paletteExtract } from '@standardbeagle/color/tools/palette-extract.js';

const ratio = contrastCheck({ foreground: '#000', background: '#fff' });
```

Each schema is also exported (`*.schema.ts`) as a Zod schema for input validation.

## License

MIT

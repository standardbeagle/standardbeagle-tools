# @standardbeagle/design-token

W3C DTCG design-token authoring, validation, transformation, diff/merge, and Tailwind config emission. MCP server + library.

## Install

```bash
npm install @standardbeagle/design-token

# or use via MCP:
npx -y @standardbeagle/design-token@latest mcp
```

Two model styles coexist:

- **Flat-token model** — `{ name, value, type, ... }` records used by `token_create`, `token_transform`, `token_export`, `token_import`.
- **W3C DTCG tree** — nested object with `$value`/`$type` leaves used by `tokens_validate`, `tokens_generate`, `tokens_diff`, `tokens_merge`, `tailwind_generate`.

## Tools

### token_create

Create a single design token. Resolves `reference` against `tokens` context if provided.

**Input:**

```ts
{
  name: string,
  value: string,
  type: 'color' | 'size' | 'spacing' | 'font' | 'border' | 'radius' | 'shadow',
  description?: string,
  reference?: string,         // name of another token to inherit value from
  tokens?: Token[],           // optional context for reference resolution
}
```

**Output:**

```ts
{ name: string, value: string, type: string, description?: string, reference?: string }
```

**Example:**

```ts
await callTool('token_create', { name: 'brand', value: '#0066cc', type: 'color' });
```

### token_transform

Transform an array of flat tokens to a target string format.

**Input:**

```ts
{
  tokens: Token[],
  format: 'css-vars' | 'scss' | 'json' | 'android-xml' | 'ios-swift',
}
```

**Output:**

```ts
{ format: string, output: string }
```

**Example:**

```ts
await callTool('token_transform', {
  tokens: [{ name: 'brand', value: '#0066cc', type: 'color' }],
  format: 'css-vars',
});
// output: ':root { --brand: #0066cc; }'
```

### tokens_validate

Validate a W3C DTCG token tree. Recursively walks groups and validates each leaf `$value` against its `$type`-specific schema (12+ types: `color`, `dimension`, `fontFamily`, `fontWeight`, `duration`, `cubicBezier`, `number`, `strokeStyle`, `border`, `transition`, `shadow`, `gradient`, `typography`).

**Input:**

```ts
{
  tokens: object,           // DTCG tree
  strict?: boolean,         // default false; when true, unknown $type → error
}
```

**Output:**

```ts
{
  valid: boolean,
  errors: Array<{ path: string, message: string }>,
  warnings: Array<{ path: string, message: string }>,
}
```

**Example:**

```ts
await callTool('tokens_validate', {
  tokens: { color: { brand: { $value: '#0066cc', $type: 'color' } } },
});
```

### tokens_generate

Generate a W3C DTCG token tree from a flat color palette + modular type scale + linear spacing scale. Output is a nested object with `color.<name>`, `font.size.{caption,small,body,h6..h1}`, and `spacing.0..N` — every leaf carries `$value`/`$type` so the result passes `tokens_validate`. Deterministic from inputs.

**Input:**

```ts
{
  palette: Record<string, string>,                  // {colorName: cssColor}
  type_scale?: { base?: number, ratio?: number },   // defaults: 16 / 1.25
  spacing?:    { base?: number, steps?: number },   // defaults: 4 / 10
}
```

**Output:**

```ts
{
  tokens: object,           // valid DTCG tree
}
```

**Example:**

```ts
await callTool('tokens_generate', {
  palette: { primary: '#0066cc', neutral: '#888888' },
  type_scale: { base: 16, ratio: 1.25 },
  spacing: { base: 4, steps: 8 },
});
```

### token_export

Export flat tokens to a target platform format with optional prefix and category filtering.

**Input:**

```ts
{
  tokens: Token[],
  format: 'css-vars' | 'scss' | 'json' | 'android-xml' | 'ios-swift',
  prefix?: string,
  includeCategories?: TokenType[],
  excludeCategories?: TokenType[],
}
```

**Output:**

```ts
{ format: string, output: string }
```

**Example:**

```ts
await callTool('token_export', {
  tokens: [{ name: 'brand', value: '#0066cc', type: 'color' }],
  format: 'scss',
  prefix: 'sb',
});
```

### token_import

Parse a CSS, SCSS, or JSON source string into the flat-token model.

**Input:**

```ts
{
  source: string,
  format: 'json' | 'css' | 'scss',
}
```

**Output:**

```ts
{ tokens: Token[] }
```

**Example:**

```ts
await callTool('token_import', {
  source: ':root { --brand: #0066cc; }',
  format: 'css',
});
```

### tokens_diff

Diff two W3C DTCG token trees at the leaf level. Flattens both trees and reports `added` (paths only in `b`), `removed` (paths only in `a`), and `changed` (different `$value`). Output arrays are sorted by path. `$description`-only edits are not reported as changes. Pure, deterministic.

**Input:**

```ts
{
  a: object,   // baseline
  b: object,   // candidate
}
```

**Output:**

```ts
{
  added:   Array<{ path: string, $value: unknown, $type?: string }>,
  removed: Array<{ path: string, $value: unknown, $type?: string }>,
  changed: Array<{ path: string, before: unknown, after: unknown }>,
}
```

**Example:**

```ts
await callTool('tokens_diff', {
  a: { color: { brand: { $value: '#0066cc', $type: 'color' } } },
  b: { color: { brand: { $value: '#0055aa', $type: 'color' } } },
});
// changed: [{ path: 'color.brand', before: '#0066cc', after: '#0055aa' }]
```

### tokens_merge

Merge a base DTCG token tree with an ordered list of overrides. Resolution modes: `last-wins` (default; rightmost source wins), `first-wins` (earliest source wins, base preferred), `error` (throws on first leaf-vs-leaf conflict with payload). Group-vs-leaf structural conflicts always throw. Every contested path is reported in `conflicts[]` regardless of mode, so callers can audit silent resolutions.

**Input:**

```ts
{
  base: object,
  overrides?: object[],
  conflict_resolution?: 'last-wins' | 'first-wins' | 'error', // default 'last-wins'
}
```

**Output:**

```ts
{
  merged: object,
  conflicts: Array<{ path: string, sources: number[], values: unknown[], winner: number }>,
}
```

**Example:**

```ts
await callTool('tokens_merge', {
  base: { color: { brand: { $value: '#0066cc', $type: 'color' } } },
  overrides: [{ color: { brand: { $value: '#0055aa', $type: 'color' } } }],
});
```

### tailwind_generate

Generate a Tailwind `theme.extend` config (and optionally a JS or TS module source) from a flat palette + modular type scale + linear spacing scale, with optional semantic-color aliases. Composes `tokens_generate` and the `toTailwindTheme` exporter — adds no new primitives. `semantic_map` entries are resolved eagerly against the palette (Tailwind has no native ref concept). Pure and deterministic.

**Input:**

```ts
{
  palette: Record<string, string>,
  type_scale: { base: number, ratio: number },
  spacing: { base: number, steps: number },
  semantic_map?: Record<string, string>,                // {alias: paletteKey}
  output_format?: 'object' | 'js-module' | 'ts-module', // default 'object'
}
```

**Output:**

```ts
{
  config: { theme: { extend: object } },
  module_source?: string,        // present when output_format !== 'object'
}
```

**Example:**

```ts
await callTool('tailwind_generate', {
  palette: { brand: '#0066cc', danger: '#dc2626' },
  type_scale: { base: 16, ratio: 1.25 },
  spacing: { base: 4, steps: 8 },
  semantic_map: { primary: 'brand' },
  output_format: 'ts-module',
});
```

## Direct TypeScript usage

```ts
import { tokenCreate }    from '@standardbeagle/design-token/tools/token-create.js';
import { tokenTransform } from '@standardbeagle/design-token/tools/token-transform.js';
import { tokensValidate } from '@standardbeagle/design-token/tools/tokens-validate.js';
import { tokensGenerate } from '@standardbeagle/design-token/tools/tokens-generate.js';
import { tokensDiff }     from '@standardbeagle/design-token/tools/tokens-diff.js';
import { tokensMerge }    from '@standardbeagle/design-token/tools/tokens-merge.js';
import { tailwindGenerate } from '@standardbeagle/design-token/tools/tailwind-generate.js';
```

## License

MIT

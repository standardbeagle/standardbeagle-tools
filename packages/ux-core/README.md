# @standardbeagle/ux-core

Shared types, validators, errors, and numerical helpers for the `@standardbeagle/*` UX MCP suite.

This package is a pure TypeScript library — **not** an MCP server. The color/a11y-audit/design-token/typography/image-processing servers depend on it for the canonical color types, error classes, validation predicates, reference fixtures, and k-means clustering.

## Install

```bash
npm install @standardbeagle/ux-core
```

## Exports

All exports are surfaced from `src/index.ts`:

```ts
export * from './color/types.js';
export * from './color/fixtures.js';
export * from './errors.js';
export * from './lib/kmeans.js';
```

## Color types

`ColorSpace` is the discriminator union of supported spaces:

```ts
type ColorSpace = 'rgb' | 'hsl' | 'hsv' | 'lab' | 'oklch' | 'hex';
```

Per-space value shapes:

```ts
interface RGB   { r: number; g: number; b: number; a?: number; } // 0-255, alpha 0-1
interface HSL   { h: number; s: number; l: number; a?: number; } // h 0-360, s/l 0-100
interface HSV   { h: number; s: number; v: number; a?: number; }
interface LAB   { l: number; a: number; b: number; alpha?: number; } // l 0-100, a/b -128..127
interface OKLCH { l: number; c: number; h: number; alpha?: number; } // l 0-1, c 0-0.4, h 0-360
type Hex = string; // '#RRGGBB' or '#RRGGBBAA'
```

Tagged-union `Color` for cross-space carriage:

```ts
type Color =
  | { space: 'rgb';   value: RGB }
  | { space: 'hsl';   value: HSL }
  | { space: 'hsv';   value: HSV }
  | { space: 'lab';   value: LAB }
  | { space: 'oklch'; value: OKLCH }
  | { space: 'hex';   value: Hex };
```

## Validators (`color/validate.ts`)

Predicates and assertions over the color types.

```ts
import { isHex, isRGB, clampChannel, assertColor } from '@standardbeagle/ux-core';

isHex('#ff0000');                    // true
isHex('#ggg');                       // false (rejects non-hex)
isRGB({ r: 255, g: 0, b: 0 });       // true
isRGB({ r: 300, g: 0, b: 0 });       // false (out of range)
clampChannel(300, 0, 255);           // 255
assertColor('#ff0000', 'hex');       // ok; throws InvalidColorError otherwise
```

`assertColor(c, space)` is a TypeScript assertion function — after the call, `c` is narrowed to `Color`.

## Errors

All errors extend `UXCoreError`, which carries a stable string `code`:

```ts
class UXCoreError extends Error {
  code: string;
}

class InvalidColorError    extends UXCoreError { } // code: 'E_INVALID_COLOR'
class OutOfRangeError      extends UXCoreError { } // code: 'E_OUT_OF_RANGE'
class UnsupportedSpaceError extends UXCoreError { } // code: 'E_UNSUPPORTED_SPACE'
```

Example:

```ts
import { InvalidColorError } from '@standardbeagle/ux-core';

try {
  assertColor('not-a-color', 'hex');
} catch (e) {
  if (e instanceof InvalidColorError) {
    console.error(e.code); // 'E_INVALID_COLOR'
  }
}
```

## Reference fixtures (`color/fixtures.ts`)

`REFERENCE_COLORS` is a frozen array of 12 cross-verified color records used for round-trip testing across spaces. Each entry carries the same color expressed as `hex`, `rgb`, `hsl`, `hsv`, `lab`, and `oklch` within 0.5-unit tolerance against colormine.org and oklch.com.

```ts
import { REFERENCE_COLORS, type ColorFixture } from '@standardbeagle/ux-core';

for (const fixture of REFERENCE_COLORS) {
  // fixture.name, fixture.hex, fixture.rgb, fixture.hsl, ...
}
```

Names included: `pure red`, `pure green`, `pure blue`, `white`, `black`, `mid-gray`, `navy`, `teal`, `orange`, `magenta`, `yellow`, `cyan`.

## K-means (`lib/kmeans.ts`)

3D k-means clustering with k-means++ seeding and Lloyd iteration. Used by `color.palette_extract` and `image-processing.palette_from_image` for dominant-color extraction.

```ts
import { kmeans, type Point, type Cluster } from '@standardbeagle/ux-core';

const points: Point[] = [
  { x: 255, y: 0,   z: 0   },
  { x: 250, y: 5,   z: 5   },
  { x: 0,   y: 0,   z: 255 },
];

const clusters: Cluster[] = kmeans(points, 2);
// [{ centroid: { x, y, z }, points: [] }, ...]
```

Signature:

```ts
function kmeans(
  points: Point[],
  k: number,
  maxIterations?: number, // default 50
  tolerance?: number,     // default 1.0
): Cluster[];
```

Behavior:
- Returns `[]` when `points.length === 0` or `k <= 0`.
- Clamps `k` to `points.length` when `k > points.length`.
- Stops early once no centroid moves more than `tolerance` between iterations.
- Returned clusters carry the final centroid; `points` is intentionally `[]` (the caller does the final assignment if it needs it).

## License

MIT

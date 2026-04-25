import { describe, it, expect } from 'vitest';
import { svgOptimize } from './svg-optimize.js';
import { SvgOptimizeInputSchema } from './svg-optimize.schema.js';
import { getTempDir } from '../test-helpers/fixtures.js';
import { join } from 'path';
import { writeFile, readFile } from 'fs/promises';
import { existsSync } from 'fs';

// Verbose icon SVG: comments, redundant whitespace, default attrs, unused id.
const VERBOSE_ICON_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generator: Test fixture for svg_optimize -->
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- decorative comment -->
    <title>icon-title</title>
    <desc>icon-desc</desc>
    <defs>
        <path id="unused-path" d="M0 0 L1 1"/>
    </defs>
    <g id="unused-group" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M12 2 L22 22 L2 22 Z" fill="#000000" fill-opacity="1.0"></path>
    </g>
</svg>
`;

describe('svgOptimize', () => {
  it('reduces an unoptimized icon SVG by more than 20%', async () => {
    const result = await svgOptimize(
      SvgOptimizeInputSchema.parse({ svg: VERBOSE_ICON_SVG }),
    );
    expect(result.original_bytes).toBe(Buffer.byteLength(VERBOSE_ICON_SVG, 'utf8'));
    expect(result.optimized_bytes).toBeLessThan(result.original_bytes);
    expect(result.reduction_percent).toBeGreaterThan(20);
    expect(result.optimized).toContain('<svg');
  });

  it('produces a <symbol id="..."> when symbol_sprite=true', async () => {
    const result = await svgOptimize(
      SvgOptimizeInputSchema.parse({
        svg: VERBOSE_ICON_SVG,
        svg_path: join(getTempDir(), 'star.svg'),
        symbol_sprite: true,
      }),
    );
    expect(result.optimized).toContain('<symbol id="star"');
    expect(result.optimized).toContain('viewBox="0 0 24 24"');
    expect(result.optimized).toContain('display:none');
    expect(result.optimized.endsWith('</symbol></svg>')).toBe(true);
  });

  it('defaults symbol id to "icon" when no svg_path is provided', async () => {
    const result = await svgOptimize(
      SvgOptimizeInputSchema.parse({ svg: VERBOSE_ICON_SVG, symbol_sprite: true }),
    );
    expect(result.optimized).toContain('<symbol id="icon"');
  });

  it('aggressive mode reduces output more than default mode', async () => {
    const def = await svgOptimize(SvgOptimizeInputSchema.parse({ svg: VERBOSE_ICON_SVG }));
    const agg = await svgOptimize(
      SvgOptimizeInputSchema.parse({ svg: VERBOSE_ICON_SVG, aggressive: true }),
    );
    // Aggressive removes width/height + forces id cleanup → should be no larger, typically smaller.
    expect(agg.optimized_bytes).toBeLessThanOrEqual(def.optimized_bytes);
    // And specifically must strip the width/height attributes from the root.
    expect(agg.optimized).not.toMatch(/<svg[^>]*\swidth="24"/);
    expect(agg.optimized).not.toMatch(/<svg[^>]*\sheight="24"/);
  });

  it('reads svg_path and produces same output as inline svg with same content', async () => {
    const tempPath = join(getTempDir(), 'svg-optimize-input.svg');
    await writeFile(tempPath, VERBOSE_ICON_SVG, 'utf8');
    const fromPath = await svgOptimize(
      SvgOptimizeInputSchema.parse({ svg_path: tempPath }),
    );
    const fromInline = await svgOptimize(
      SvgOptimizeInputSchema.parse({ svg: VERBOSE_ICON_SVG }),
    );
    expect(fromPath.optimized).toBe(fromInline.optimized);
    expect(fromPath.optimized_bytes).toBe(fromInline.optimized_bytes);
  });

  it('writes to output_path when provided', async () => {
    const outPath = join(getTempDir(), 'svg-optimize-output.svg');
    const result = await svgOptimize(
      SvgOptimizeInputSchema.parse({ svg: VERBOSE_ICON_SVG, output_path: outPath }),
    );
    expect(existsSync(outPath)).toBe(true);
    const written = await readFile(outPath, 'utf8');
    expect(written).toBe(result.optimized);
  });

  it('throws on malformed XML', async () => {
    const malformed = '<svg><path d="M0 0"</svg>';
    await expect(
      svgOptimize(SvgOptimizeInputSchema.parse({ svg: malformed })),
    ).rejects.toThrow();
  });

  it('rejects input with neither svg nor svg_path via ZodError', () => {
    expect(() => SvgOptimizeInputSchema.parse({})).toThrow();
  });
});

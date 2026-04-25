import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { paletteFromImage } from './palette-from-image.js';
import {
  PaletteFromImageInputSchema,
  PaletteFromImageOutputSchema,
} from './palette-from-image.schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturePhoto = path.resolve(__dirname, '../../test/fixtures/photo.jpg');
const fixtureDiagram = path.resolve(__dirname, '../../test/fixtures/diagram.png');

describe('palette-from-image', () => {
  it('returns exactly count entries when count=5', async () => {
    const input = PaletteFromImageInputSchema.parse({
      input_path: fixturePhoto,
      count: 5,
    });
    const result = await paletteFromImage(input);
    expect(result.palette).toHaveLength(5);
  });

  it('produces palette percentages that sum to ~100 (D6-compatible scale)', async () => {
    const result = await paletteFromImage(
      PaletteFromImageInputSchema.parse({ input_path: fixturePhoto, count: 5 }),
    );
    const sum = result.palette.reduce((s, e) => s + e.percentage, 0);
    // Each percentage is rounded to 2 decimals, so accumulated rounding error
    // across N entries can be up to N * 0.005. Use a 0.5 tolerance.
    expect(sum).toBeGreaterThan(99.5);
    expect(sum).toBeLessThan(100.5);
  });

  it('emits hex strings matching #rrggbb', async () => {
    const result = await paletteFromImage(
      PaletteFromImageInputSchema.parse({ input_path: fixtureDiagram, count: 6 }),
    );
    for (const entry of result.palette) {
      expect(entry.hex).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('output shape parses against the schema (mirror of D6 PaletteExtractOutput)', async () => {
    const result = await paletteFromImage(
      PaletteFromImageInputSchema.parse({ input_path: fixturePhoto, count: 4 }),
    );
    // PaletteFromImageOutputSchema is byte-identical in shape to
    // @standardbeagle/color's PaletteExtractOutputSchema (intentional duplication
    // at the type-boundary; algorithm itself is shared via ux-core kmeans).
    expect(() => PaletteFromImageOutputSchema.parse(result)).not.toThrow();
  });

  it('palette entries are sorted by percentage descending', async () => {
    const result = await paletteFromImage(
      PaletteFromImageInputSchema.parse({ input_path: fixtureDiagram, count: 5 }),
    );
    for (let i = 1; i < result.palette.length; i++) {
      expect(result.palette[i - 1]!.percentage).toBeGreaterThanOrEqual(
        result.palette[i]!.percentage,
      );
    }
  });

  it('rgb fields are integers in [0,255]', async () => {
    const result = await paletteFromImage(
      PaletteFromImageInputSchema.parse({ input_path: fixturePhoto, count: 3 }),
    );
    for (const entry of result.palette) {
      for (const channel of [entry.rgb.r, entry.rgb.g, entry.rgb.b]) {
        expect(Number.isInteger(channel)).toBe(true);
        expect(channel).toBeGreaterThanOrEqual(0);
        expect(channel).toBeLessThanOrEqual(255);
      }
    }
  });
});

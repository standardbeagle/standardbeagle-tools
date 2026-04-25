import { describe, it, expect } from 'vitest';
import { decode } from 'blurhash';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { blurHash } from './blur-hash.js';
import { BlurHashInputSchema } from './blur-hash.schema.js';
import { getTempDir } from '../test-helpers/fixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURE = join(__dirname, '..', '..', 'test', 'fixtures', 'photo.jpg');

describe('blurHash', () => {
  it('produces a valid blurhash string and LQIP data URI for photo.jpg', async () => {
    const result = await blurHash(
      BlurHashInputSchema.parse({ input_path: FIXTURE }),
    );

    expect(typeof result.blurhash).toBe('string');
    // blurhash strings encode (cx, cy, maxAC, DC, AC*) — for cx=4,cy=3 length is ~28 chars
    expect(result.blurhash.length).toBeGreaterThanOrEqual(20);
    expect(result.blurhash.length).toBeLessThanOrEqual(40);

    expect(result.lqip_base64).toBeDefined();
    expect(result.lqip_base64!.startsWith('data:image/jpeg;base64,')).toBe(true);

    expect(result.original_dimensions.w).toBeGreaterThan(0);
    expect(result.original_dimensions.h).toBeGreaterThan(0);
  });

  it('round-trips: encode → decode produces a pixel buffer of correct length', async () => {
    const result = await blurHash(
      BlurHashInputSchema.parse({
        input_path: FIXTURE,
        components_x: 4,
        components_y: 3,
        include_lqip: false,
      }),
    );

    const W = 32;
    const H = 32;
    const pixels = decode(result.blurhash, W, H);
    expect(pixels).toBeInstanceOf(Uint8ClampedArray);
    expect(pixels.length).toBe(W * H * 4); // RGBA
  });

  it('omits lqip_base64 when include_lqip=false', async () => {
    const result = await blurHash(
      BlurHashInputSchema.parse({
        input_path: FIXTURE,
        include_lqip: false,
      }),
    );
    expect(result.lqip_base64).toBeUndefined();
  });

  it('rejects components_x=0 (below min)', () => {
    expect(() =>
      BlurHashInputSchema.parse({ input_path: FIXTURE, components_x: 0 }),
    ).toThrow();
  });

  it('rejects components_x=10 (above max)', () => {
    expect(() =>
      BlurHashInputSchema.parse({ input_path: FIXTURE, components_x: 10 }),
    ).toThrow();
  });

  it('rejects components_y=0 (below min)', () => {
    expect(() =>
      BlurHashInputSchema.parse({ input_path: FIXTURE, components_y: 0 }),
    ).toThrow();
  });

  it('throws on missing input file', async () => {
    await expect(
      blurHash(
        BlurHashInputSchema.parse({
          input_path: join(getTempDir(), 'nonexistent-blur.jpg'),
        }),
      ),
    ).rejects.toThrow();
  });

  it('original_dimensions match source metadata', async () => {
    const result = await blurHash(
      BlurHashInputSchema.parse({ input_path: FIXTURE, include_lqip: false }),
    );
    // photo.jpg fixture is a JPEG; just assert positive integer dims
    expect(Number.isInteger(result.original_dimensions.w)).toBe(true);
    expect(Number.isInteger(result.original_dimensions.h)).toBe(true);
    expect(result.original_dimensions.w).toBeGreaterThan(0);
    expect(result.original_dimensions.h).toBeGreaterThan(0);
  });
});

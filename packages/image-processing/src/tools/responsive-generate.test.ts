import { describe, it, expect, beforeAll } from 'vitest';
import { mkdirSync } from 'fs';
import { stat } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import { responsiveGenerate } from './responsive-generate.js';
import { getTempDir } from '../test-helpers/fixtures.js';

async function createSource(name: string, width: number, height: number): Promise<string> {
  const path = join(getTempDir(), name);
  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 80, g: 120, b: 200 },
    },
  })
    .jpeg({ quality: 90 })
    .toFile(path);
  return path;
}

function makeOutDir(name: string): string {
  const dir = join(getTempDir(), name);
  mkdirSync(dir, { recursive: true });
  return dir;
}

describe('responsiveGenerate', () => {
  let large: string;
  let small: string;
  let medium: string;

  beforeAll(async () => {
    large = await createSource('rg-large.jpg', 2000, 1333);
    small = await createSource('rg-small.jpg', 800, 600);
    medium = await createSource('rg-medium.jpg', 1000, 750);
  });

  it('produces 5 variants at default breakpoints for a 2000px source', async () => {
    const outDir = makeOutDir('rg-out-large');
    const result = await responsiveGenerate({
      input_path: large,
      output_dir: outDir,
      breakpoints: [320, 640, 960, 1280, 1920],
      format: 'webp',
      quality: 80,
    });

    expect(result.variants).toHaveLength(5);
    expect(result.variants.map((v) => v.width)).toEqual([320, 640, 960, 1280, 1920]);
    for (const v of result.variants) {
      const meta = await sharp(v.path).metadata();
      expect(meta.width).toBe(v.width);
      expect(meta.format).toBe('webp');
      const s = await stat(v.path);
      expect(v.bytes).toBe(s.size);
      expect(v.bytes).toBeGreaterThan(0);
    }
  });

  it('skips breakpoints wider than source: 800px source → only 320, 640 fit', async () => {
    const outDir = makeOutDir('rg-out-small');
    const result = await responsiveGenerate({
      input_path: small,
      output_dir: outDir,
      breakpoints: [320, 640, 960, 1280, 1920],
      format: 'webp',
      quality: 80,
    });

    expect(result.variants).toHaveLength(2);
    expect(result.variants.map((v) => v.width)).toEqual([320, 640]);
  });

  it('skips breakpoints wider than source: 1000px source → 3 variants (320, 640, 960)', async () => {
    const outDir = makeOutDir('rg-out-medium');
    const result = await responsiveGenerate({
      input_path: medium,
      output_dir: outDir,
      breakpoints: [320, 640, 960, 1280, 1920],
      format: 'webp',
      quality: 80,
    });

    expect(result.variants).toHaveLength(3);
    expect(result.variants.map((v) => v.width)).toEqual([320, 640, 960]);
  });

  it('builds well-formed srcset with W descriptor in order', async () => {
    const outDir = makeOutDir('rg-out-srcset');
    const result = await responsiveGenerate({
      input_path: large,
      output_dir: outDir,
      breakpoints: [320, 640, 1280],
      format: 'webp',
      quality: 80,
    });

    const parts = result.srcset.split(', ');
    expect(parts).toHaveLength(3);
    expect(parts[0]).toMatch(/^.+\s320w$/);
    expect(parts[1]).toMatch(/^.+\s640w$/);
    expect(parts[2]).toMatch(/^.+\s1280w$/);
    for (const v of result.variants) {
      expect(result.srcset).toContain(`${v.path} ${v.width}w`);
    }
  });

  it('respects custom breakpoints', async () => {
    const outDir = makeOutDir('rg-out-custom');
    const result = await responsiveGenerate({
      input_path: large,
      output_dir: outDir,
      breakpoints: [400, 800],
      format: 'webp',
      quality: 80,
    });
    expect(result.variants.map((v) => v.width)).toEqual([400, 800]);
  });

  it('returns empty variants and empty srcset when all breakpoints exceed source', async () => {
    const outDir = makeOutDir('rg-out-empty');
    const result = await responsiveGenerate({
      input_path: small,
      output_dir: outDir,
      breakpoints: [1000, 1280, 1920],
      format: 'webp',
      quality: 80,
    });
    expect(result.variants).toEqual([]);
    expect(result.srcset).toBe('');
    expect(result.sizes_suggestion).toBe('100vw');
  });

  it('produces valid files in webp, avif, and jpg formats', async () => {
    for (const format of ['webp', 'avif', 'jpg'] as const) {
      const outDir = makeOutDir(`rg-out-fmt-${format}`);
      const result = await responsiveGenerate({
        input_path: large,
        output_dir: outDir,
        breakpoints: [320, 640],
        format,
        quality: 80,
      });
      expect(result.variants).toHaveLength(2);
      for (const v of result.variants) {
        const meta = await sharp(v.path).metadata();
        // sharp reports AVIF as 'heif' (libheif container); accept both.
        const expected =
          format === 'jpg' ? ['jpeg'] : format === 'avif' ? ['avif', 'heif'] : ['webp'];
        expect(expected).toContain(meta.format);
        expect(v.path.endsWith(`.${format}`)).toBe(true);
      }
    }
  });

  it('emits sizes_suggestion (max-width: 640px) 100vw, 50vw when 2+ variants', async () => {
    const outDir = makeOutDir('rg-out-sizes-multi');
    const result = await responsiveGenerate({
      input_path: large,
      output_dir: outDir,
      breakpoints: [320, 640],
      format: 'webp',
      quality: 80,
    });
    expect(result.sizes_suggestion).toBe('(max-width: 640px) 100vw, 50vw');
  });

  it('emits 100vw sizes_suggestion when only 1 variant', async () => {
    const outDir = makeOutDir('rg-out-sizes-one');
    const result = await responsiveGenerate({
      input_path: small,
      output_dir: outDir,
      breakpoints: [320, 1280, 1920],
      format: 'webp',
      quality: 80,
    });
    expect(result.variants).toHaveLength(1);
    expect(result.sizes_suggestion).toBe('100vw');
  });
});

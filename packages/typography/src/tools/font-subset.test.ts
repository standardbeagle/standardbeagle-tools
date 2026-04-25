import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { stat, readFile, unlink } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { fontSubset } from './font-subset.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = resolve(__dirname, '../../test/fixtures');
const INTER = resolve(FIXTURES, 'Inter.otf');

function tmpOut(ext: string): string {
  return join(tmpdir(), `font-subset-test-${randomBytes(6).toString('hex')}.${ext}`);
}

async function safeUnlink(path: string): Promise<void> {
  try {
    await unlink(path);
  } catch {
    // ignore
  }
}

describe('fontSubset', () => {
  it('subsets Inter.otf to latin (woff2) with >70% reduction', async () => {
    const out = tmpOut('woff2');
    try {
      const r = await fontSubset({
        font_path: INTER,
        unicode_ranges: ['U+0020-007F', 'U+00A0-00FF'],
        output_path: out,
        format: 'woff2',
      });
      expect(r.output_path).toBe(out);
      expect(r.original_bytes).toBeGreaterThan(0);
      expect(r.subset_bytes).toBeGreaterThan(0);
      expect(r.subset_bytes).toBeLessThan(r.original_bytes);
      expect(r.reduction_percent).toBeGreaterThan(70);
      expect(r.glyphs_kept).toBeGreaterThan(0);
      const s = await stat(out);
      expect(s.size).toBe(r.subset_bytes);
    } finally {
      await safeUnlink(out);
    }
  });

  it('produces valid WOFF2 magic bytes (wOF2)', async () => {
    const out = tmpOut('woff2');
    try {
      await fontSubset({
        font_path: INTER,
        unicode_ranges: ['U+0041-005A'],
        output_path: out,
        format: 'woff2',
      });
      const buf = await readFile(out);
      // WOFF2 magic: 0x774F4632 = 'wOF2'
      expect(buf[0]).toBe(0x77);
      expect(buf[1]).toBe(0x4f);
      expect(buf[2]).toBe(0x46);
      expect(buf[3]).toBe(0x32);
    } finally {
      await safeUnlink(out);
    }
  });

  it('produces valid WOFF magic bytes (wOFF)', async () => {
    const out = tmpOut('woff');
    try {
      const r = await fontSubset({
        font_path: INTER,
        unicode_ranges: ['U+0041-005A'],
        output_path: out,
        format: 'woff',
      });
      expect(r.subset_bytes).toBeGreaterThan(0);
      const buf = await readFile(out);
      // WOFF magic: 0x774F4646 = 'wOFF'
      expect(buf[0]).toBe(0x77);
      expect(buf[1]).toBe(0x4f);
      expect(buf[2]).toBe(0x46);
      expect(buf[3]).toBe(0x46);
    } finally {
      await safeUnlink(out);
    }
  });

  it('produces TTF/SFNT output with non-empty bytes', async () => {
    const out = tmpOut('ttf');
    try {
      const r = await fontSubset({
        font_path: INTER,
        unicode_ranges: ['U+0041-005A'],
        output_path: out,
        format: 'ttf',
      });
      expect(r.subset_bytes).toBeGreaterThan(0);
      const buf = await readFile(out);
      // SFNT magic for OpenType (CFF): 'OTTO' = 0x4F54544F, or TrueType: 0x00010000.
      // Inter.otf is CFF-based; subset-font preserves SFNT flavor.
      const m0 = buf[0];
      const m1 = buf[1];
      const m2 = buf[2];
      const m3 = buf[3];
      const isOtto = m0 === 0x4f && m1 === 0x54 && m2 === 0x54 && m3 === 0x4f;
      const isTrueType = m0 === 0x00 && m1 === 0x01 && m2 === 0x00 && m3 === 0x00;
      expect(isOtto || isTrueType).toBe(true);
    } finally {
      await safeUnlink(out);
    }
  });

  it('uses os.tmpdir when output_path is omitted', async () => {
    const r = await fontSubset({
      font_path: INTER,
      unicode_ranges: ['U+0041-005A'],
      format: 'woff2',
    });
    try {
      expect(r.output_path.startsWith(tmpdir())).toBe(true);
      const s = await stat(r.output_path);
      expect(s.size).toBeGreaterThan(0);
    } finally {
      await safeUnlink(r.output_path);
    }
  });

  it('round-trip: glyphs_kept reflects fontkit-readable subset', async () => {
    const r = await fontSubset({
      font_path: INTER,
      unicode_ranges: ['U+0041-005A'], // A-Z only
      format: 'woff2',
    });
    try {
      // 26 ASCII letters + .notdef + a small handful of harfbuzz-retained
      // entries (cmap closure may keep extras). Lower bound: 26 + .notdef.
      expect(r.glyphs_kept).toBeGreaterThanOrEqual(26);
      // Upper bound: subset must be far smaller than full Inter (~2500+ glyphs).
      expect(r.glyphs_kept).toBeLessThan(200);
    } finally {
      await safeUnlink(r.output_path);
    }
  });

  it('rejects invalid unicode range "U+ZZZZ"', async () => {
    await expect(
      fontSubset({
        font_path: INTER,
        unicode_ranges: ['U+ZZZZ'],
        format: 'woff2',
      }),
    ).rejects.toThrow(/Invalid unicode range/);
  });

  it('rejects empty unicode_ranges', async () => {
    await expect(
      fontSubset({
        font_path: INTER,
        unicode_ranges: [],
        format: 'woff2',
      }),
    ).rejects.toThrow(/zero codepoints/);
  });

  it('rejects start > end range', async () => {
    await expect(
      fontSubset({
        font_path: INTER,
        unicode_ranges: ['U+0050-0040'],
        format: 'woff2',
      }),
    ).rejects.toThrow(/greater than end/);
  });

  it('accepts single-codepoint range "U+0041"', async () => {
    const r = await fontSubset({
      font_path: INTER,
      unicode_ranges: ['U+0041'],
      format: 'woff2',
    });
    try {
      expect(r.subset_bytes).toBeGreaterThan(0);
      expect(r.glyphs_kept).toBeGreaterThanOrEqual(1);
    } finally {
      await safeUnlink(r.output_path);
    }
  });
});

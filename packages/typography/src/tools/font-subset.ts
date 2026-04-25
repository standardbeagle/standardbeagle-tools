import { readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { createRequire } from 'node:module';
import * as fontkit from 'fontkit';
import type { Font, FontCollection } from 'fontkit';
import type { FontSubsetInput, FontSubsetOutput } from './font-subset.schema.js';

const require = createRequire(import.meta.url);
// subset-font is CJS; default-export the function via createRequire.
const subsetFont = require('subset-font') as (
  buffer: Buffer,
  text: string,
  options: { targetFormat: 'sfnt' | 'woff' | 'woff2' },
) => Promise<Buffer>;

const RANGE_RE = /^U\+([0-9A-Fa-f]{1,6})(?:-([0-9A-Fa-f]{1,6}))?$/;
const MAX_CODEPOINT = 0x10ffff;

function parseUnicodeRanges(ranges: string[]): number[] {
  const set = new Set<number>();
  for (const raw of ranges) {
    const trimmed = raw.trim();
    const m = RANGE_RE.exec(trimmed);
    if (!m) {
      throw new Error(
        `Invalid unicode range "${raw}". Expected formats: "U+XXXX" or "U+XXXX-YYYY" (1-6 hex digits).`,
      );
    }
    const startHex = m[1];
    const endHex = m[2];
    if (startHex === undefined) {
      throw new Error(`Invalid unicode range "${raw}".`);
    }
    const start = parseInt(startHex, 16);
    const end = endHex !== undefined ? parseInt(endHex, 16) : start;
    if (start > end) {
      throw new Error(
        `Invalid unicode range "${raw}": start (U+${start.toString(16)}) is greater than end (U+${end.toString(16)}).`,
      );
    }
    if (end > MAX_CODEPOINT) {
      throw new Error(
        `Invalid unicode range "${raw}": end exceeds U+10FFFF (Unicode max).`,
      );
    }
    for (let cp = start; cp <= end; cp++) {
      // Skip surrogate range — not valid as standalone codepoints.
      if (cp >= 0xd800 && cp <= 0xdfff) continue;
      set.add(cp);
    }
  }
  return [...set];
}

function codepointsToString(codepoints: number[]): string {
  return codepoints.map((cp) => String.fromCodePoint(cp)).join('');
}

function isCollection(font: Font | FontCollection): font is FontCollection {
  return 'fonts' in font && Array.isArray((font as FontCollection).fonts);
}

function pickFont(opened: Font | FontCollection, label: string): Font {
  if (isCollection(opened)) {
    const first = opened.fonts[0];
    if (!first) {
      throw new Error(`Font collection at ${label} contains no fonts`);
    }
    return first;
  }
  return opened;
}

function countGlyphsKept(buffer: Buffer, format: 'woff2' | 'woff' | 'ttf'): number {
  // fontkit.create accepts a Buffer for in-memory parsing; for woff2 it
  // transparently decompresses. Extension-less so use create() over openSync().
  const opened = (fontkit as unknown as {
    create: (buf: Buffer) => Font | FontCollection;
  }).create(buffer);
  const font = pickFont(opened, `<subset:${format}>`);
  return font.numGlyphs;
}

function defaultOutputPath(format: 'woff2' | 'woff' | 'ttf'): string {
  const ext = format;
  const name = `font-subset-${randomBytes(6).toString('hex')}.${ext}`;
  return join(tmpdir(), name);
}

export async function fontSubset(input: FontSubsetInput): Promise<FontSubsetOutput> {
  const codepoints = parseUnicodeRanges(input.unicode_ranges);
  if (codepoints.length === 0) {
    throw new Error('unicode_ranges resolved to zero codepoints');
  }
  const text = codepointsToString(codepoints);

  const originalBuffer = await readFile(input.font_path);
  const originalBytes = originalBuffer.length;

  const targetFormat: 'sfnt' | 'woff' | 'woff2' =
    input.format === 'ttf' ? 'sfnt' : input.format;

  const subsetBuffer = await subsetFont(originalBuffer, text, { targetFormat });
  const subsetBytes = subsetBuffer.length;

  const outputPath = input.output_path ?? defaultOutputPath(input.format);
  await writeFile(outputPath, subsetBuffer);

  const glyphsKept = countGlyphsKept(subsetBuffer, input.format);

  const reductionPercent =
    originalBytes > 0
      ? Number((((originalBytes - subsetBytes) / originalBytes) * 100).toFixed(2))
      : 0;

  return {
    output_path: outputPath,
    original_bytes: originalBytes,
    subset_bytes: subsetBytes,
    reduction_percent: reductionPercent,
    glyphs_kept: glyphsKept,
  };
}

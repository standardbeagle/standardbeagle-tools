import * as fontkit from 'fontkit';
import type { Font, FontCollection } from 'fontkit';
import type { FontMetricsInput, FontMetricsOutput } from './font-metrics.schema.js';

function isCollection(font: Font | FontCollection): font is FontCollection {
  return 'fonts' in font && Array.isArray((font as FontCollection).fonts);
}

function inferWeight(font: Font): number {
  const name = font.subfamilyName ?? font.postscriptName ?? '';
  const lower = name.toLowerCase();
  if (lower.includes('thin') || lower.includes('hairline')) return 100;
  if (lower.includes('extralight') || lower.includes('ultralight')) return 200;
  if (lower.includes('light')) return 300;
  if (lower.includes('medium')) return 500;
  if (lower.includes('semibold') || lower.includes('demibold')) return 600;
  if (lower.includes('extrabold') || lower.includes('ultrabold')) return 800;
  if (lower.includes('black') || lower.includes('heavy')) return 900;
  if (lower.includes('bold')) return 700;
  return 400;
}

function inferStyle(font: Font): string {
  const name = (font.subfamilyName ?? font.postscriptName ?? '').toLowerCase();
  if (name.includes('italic')) return 'italic';
  if (name.includes('oblique')) return 'oblique';
  return 'normal';
}

export function fontMetrics(input: FontMetricsInput): FontMetricsOutput {
  const opened = fontkit.openSync(input.font_path);
  let font: Font;
  if (isCollection(opened)) {
    const first = opened.fonts[0];
    if (!first) {
      throw new Error(`Font collection at ${input.font_path} contains no fonts`);
    }
    font = first;
  } else {
    font = opened;
  }

  const unitsPerEm = font.unitsPerEm;
  const ascent = font.ascent;
  const descent = font.descent;
  const lineGap = font.lineGap;
  const xHeight = font.xHeight ?? 0;
  const capHeight = font.capHeight ?? 0;

  const recommended =
    unitsPerEm > 0 ? (ascent - descent + lineGap) / unitsPerEm : 0;

  return {
    family: font.familyName,
    style: inferStyle(font),
    weight: inferWeight(font),
    units_per_em: unitsPerEm,
    ascent,
    descent,
    x_height: xHeight,
    cap_height: capHeight,
    line_gap: lineGap,
    recommended_line_height: Number(recommended.toFixed(4)),
  };
}

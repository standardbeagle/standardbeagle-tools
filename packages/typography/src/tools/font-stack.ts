import * as fontkit from 'fontkit';
import type { Font, FontCollection } from 'fontkit';
import { basename, extname } from 'node:path';
import type { FontStackInput, FontStackOutput } from './font-stack.schema.js';
import {
  SYSTEM_FONT_STACKS,
  type FamilyType,
  type SystemFontMetrics,
} from '../lib/system-font-metrics.js';

function isCollection(font: Font | FontCollection): font is FontCollection {
  return 'fonts' in font && Array.isArray((font as FontCollection).fonts);
}

function readPrimaryFont(fontPath: string): Font {
  const opened = fontkit.openSync(fontPath);
  if (isCollection(opened)) {
    const first = opened.fonts[0];
    if (!first) {
      throw new Error(`Font collection at ${fontPath} contains no fonts`);
    }
    return first;
  }
  return opened;
}

function quoteFamily(name: string): string {
  // Quote families that contain whitespace or non-identifier characters,
  // leave bare identifiers (Arial, system-ui, -apple-system, sans-serif) alone.
  if (/^-?[a-zA-Z_][a-zA-Z0-9_-]*$/.test(name)) {
    return name;
  }
  return `'${name.replace(/'/g, "\\'")}'`;
}

function fmtPercent(value: number): string {
  // 2 decimal places, strip trailing zeros for readability.
  return `${Number(value.toFixed(2))}%`;
}

export function fontStack(input: FontStackInput): FontStackOutput {
  const familyType: FamilyType = input.family_type;
  const font = readPrimaryFont(input.custom_font_path);

  const unitsPerEm = font.unitsPerEm;
  if (unitsPerEm <= 0) {
    throw new Error(
      `Font at ${input.custom_font_path} has invalid unitsPerEm=${unitsPerEm}`,
    );
  }

  const customAscentRatio = font.ascent / unitsPerEm;
  const customDescentRatio = Math.abs(font.descent) / unitsPerEm;
  const customLineGapRatio = font.lineGap / unitsPerEm;
  const customXHeight = font.xHeight ?? 0;
  const customXHeightRatio = customXHeight / unitsPerEm;

  const stack = SYSTEM_FONT_STACKS[familyType];
  const primaryFallback: SystemFontMetrics = stack[0]!;

  if (customXHeightRatio <= 0 || primaryFallback.xHeightRatio <= 0) {
    throw new Error(
      `Cannot compute size-adjust: xHeight ratio is zero (custom=${customXHeightRatio}, fallback=${primaryFallback.xHeightRatio})`,
    );
  }

  // size-adjust expresses how the fallback should be scaled so its x-height
  // matches the custom font's x-height. CSS multiplies the fallback's metrics
  // by size-adjust, so the override percentages must be divided by it.
  const sizeAdjust = (customXHeightRatio / primaryFallback.xHeightRatio) * 100;
  const sizeAdjustFraction = sizeAdjust / 100;

  const ascentOverride = (customAscentRatio / sizeAdjustFraction) * 100;
  const descentOverride = (customDescentRatio / sizeAdjustFraction) * 100;
  const lineGapOverride = (customLineGapRatio / sizeAdjustFraction) * 100;

  const customName = font.familyName || basename(input.custom_font_path, extname(input.custom_font_path));
  const fallbackName = `${customName}-fallback`;

  const stackArray = [
    customName,
    fallbackName,
    ...stack.map((m) => m.fontName),
    familyType,
  ];

  const atFontFace = [
    `@font-face {`,
    `  font-family: ${quoteFamily(fallbackName)};`,
    `  src: local(${quoteFamily(primaryFallback.fontName)});`,
    `  size-adjust: ${fmtPercent(sizeAdjust)};`,
    `  ascent-override: ${fmtPercent(ascentOverride)};`,
    `  descent-override: ${fmtPercent(descentOverride)};`,
    `  line-gap-override: ${fmtPercent(lineGapOverride)};`,
    `}`,
  ].join('\n');

  const cssFamilyList = stackArray.map(quoteFamily).join(', ');
  const cssUsage = `.body {\n  font-family: ${cssFamilyList};\n}`;

  return {
    stack: stackArray,
    at_font_face: atFontFace,
    css_usage: cssUsage,
  };
}

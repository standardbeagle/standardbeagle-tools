import type { ReadableWidthInput, ReadableWidthOutput } from './readable-width.schema.js';

export function readableWidth(input: ReadableWidthInput): ReadableWidthOutput {
  const fontSize = input.fontSize;
  const measure = input.measure ?? 'medium';

  const charWidth = fontSize * 0.5;
  const idealChars = measure === 'narrow' ? 45 : measure === 'wide' ? 75 : 66;
  const optimalWidth = idealChars * charWidth;

  const contentWidth = input.contentWidth ?? optimalWidth;
  const cpl = charWidth === 0 ? 0 : contentWidth / charWidth;

  return {
    optimalWidth: Math.round(optimalWidth),
    optimalChars: idealChars,
    cpl: Number(cpl.toFixed(2)),
  };
}

import type { LineHeightInput, LineHeightOutput } from './line-height.schema.js';

export function lineHeight(input: LineHeightInput): LineHeightOutput {
  const fontSize = input.fontSize;
  const width = input.width;

  let lh = 1.5;

  if (width !== undefined && width > 0 && fontSize > 0) {
    const widthFactor = width / (fontSize * 30);
    lh = 1.5 + widthFactor;
  }

  lh = Math.max(1.2, Math.min(2.0, lh));

  return {
    lineHeight: Number(lh.toFixed(3)),
    lineHeightPx: Math.round(fontSize * lh),
  };
}

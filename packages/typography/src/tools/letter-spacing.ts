import type { LetterSpacingInput, LetterSpacingOutput } from './letter-spacing.schema.js';

const trackingMap: Record<string, number> = {
  body: 0,
  heading: -0.02,
  display: -0.03,
  caption: 0.01,
  button: 0.05,
};

export function letterSpacing(input: LetterSpacingInput): LetterSpacingOutput {
  const useCase = input.useCase ?? 'body';
  const tracking = trackingMap[useCase] ?? 0;
  const letterSpacingPx = input.fontSize * tracking;

  return {
    tracking,
    letterSpacingPx: Number(letterSpacingPx.toFixed(3)),
  };
}

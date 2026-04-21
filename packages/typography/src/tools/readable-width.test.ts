import { describe, it, expect } from 'vitest';
import { readableWidth } from './readable-width.js';

describe('readableWidth', () => {
  it('returns medium defaults for base font size', () => {
    const result = readableWidth({ fontSize: 16 });
    expect(result.optimalChars).toBe(66);
    expect(result.optimalWidth).toBe(528); // 66 * 16 * 0.5
  });

  it('calculates narrow measure', () => {
    const result = readableWidth({ fontSize: 16, measure: 'narrow' });
    expect(result.optimalChars).toBe(45);
    expect(result.optimalWidth).toBe(360);
  });

  it('calculates wide measure', () => {
    const result = readableWidth({ fontSize: 16, measure: 'wide' });
    expect(result.optimalChars).toBe(75);
    expect(result.optimalWidth).toBe(600);
  });

  it('computes cpl when contentWidth is provided', () => {
    const result = readableWidth({ fontSize: 16, contentWidth: 800 });
    expect(result.cpl).toBe(100); // 800 / (16 * 0.5)
  });

  it('handles zero font size', () => {
    const result = readableWidth({ fontSize: 0 });
    expect(result.optimalWidth).toBe(0);
    expect(result.cpl).toBe(0);
  });

  it('handles negative font size gracefully', () => {
    const result = readableWidth({ fontSize: -16 });
    expect(result.optimalWidth).toBe(-528);
  });
});

import { describe, it, expect } from 'vitest';
import { lineHeight } from './line-height.js';

describe('lineHeight', () => {
  it('returns default 1.5 when width is not provided', () => {
    const result = lineHeight({ fontSize: 16 });
    expect(result.lineHeight).toBe(1.5);
    expect(result.lineHeightPx).toBe(24);
  });

  it('adjusts line height for wide columns', () => {
    const result = lineHeight({ fontSize: 16, width: 960 });
    expect(result.lineHeight).toBeGreaterThan(1.5);
  });

  it('small width stays near base 1.5', () => {
    const result = lineHeight({ fontSize: 1000, width: 1 });
    expect(result.lineHeight).toBe(1.5);
  });

  it('clamps to maximum 2.0', () => {
    const result = lineHeight({ fontSize: 16, width: 10000 });
    expect(result.lineHeight).toBe(2.0);
  });

  it('handles zero font size', () => {
    const result = lineHeight({ fontSize: 0 });
    expect(result.lineHeightPx).toBe(0);
  });

  it('ignores width when font size is zero to avoid divide by zero', () => {
    const result = lineHeight({ fontSize: 0, width: 960 });
    expect(result.lineHeight).toBe(1.5);
  });
});

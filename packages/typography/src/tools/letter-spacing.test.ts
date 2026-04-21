import { describe, it, expect } from 'vitest';
import { letterSpacing } from './letter-spacing.js';

describe('letterSpacing', () => {
  it('body returns 0em tracking', () => {
    const result = letterSpacing({ fontSize: 16, useCase: 'body' });
    expect(result.tracking).toBe(0);
    expect(result.letterSpacingPx).toBe(0);
  });

  it('heading returns -0.02em', () => {
    const result = letterSpacing({ fontSize: 16, useCase: 'heading' });
    expect(result.tracking).toBe(-0.02);
    expect(result.letterSpacingPx).toBeCloseTo(-0.32, 2);
  });

  it('display returns -0.03em', () => {
    const result = letterSpacing({ fontSize: 24, useCase: 'display' });
    expect(result.tracking).toBe(-0.03);
    expect(result.letterSpacingPx).toBeCloseTo(-0.72, 2);
  });

  it('caption returns 0.01em', () => {
    const result = letterSpacing({ fontSize: 12, useCase: 'caption' });
    expect(result.tracking).toBe(0.01);
    expect(result.letterSpacingPx).toBeCloseTo(0.12, 2);
  });

  it('button returns 0.05em', () => {
    const result = letterSpacing({ fontSize: 14, useCase: 'button' });
    expect(result.tracking).toBe(0.05);
    expect(result.letterSpacingPx).toBeCloseTo(0.7, 2);
  });

  it('defaults to body when useCase is omitted', () => {
    const result = letterSpacing({ fontSize: 16 });
    expect(result.tracking).toBe(0);
  });

  it('handles zero font size', () => {
    const result = letterSpacing({ fontSize: 0, useCase: 'button' });
    expect(result.letterSpacingPx).toBe(0);
  });

  it('handles negative font size', () => {
    const result = letterSpacing({ fontSize: -16, useCase: 'button' });
    expect(result.letterSpacingPx).toBeCloseTo(-0.8, 2);
  });
});

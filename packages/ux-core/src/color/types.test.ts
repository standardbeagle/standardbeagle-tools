import { describe, it, expect } from 'vitest';
import type { Color, RGB, HSL, HSV, LAB, OKLCH, Hex } from './types.js';

describe('Color types', () => {
  it('discriminated union narrows to RGB', () => {
    const color: Color = { space: 'rgb', value: { r: 255, g: 0, b: 0 } };
    expect(color.space).toBe('rgb');
    if (color.space === 'rgb') {
      expect(color.value.r).toBe(255);
    }
  });

  it('discriminated union narrows to HSL', () => {
    const color: Color = { space: 'hsl', value: { h: 120, s: 100, l: 50 } };
    expect(color.space).toBe('hsl');
    if (color.space === 'hsl') {
      expect(color.value.s).toBe(100);
    }
  });

  it('optional alpha channel is present on RGB', () => {
    const color: RGB = { r: 128, g: 128, b: 128, a: 0.5 };
    expect(color.a).toBe(0.5);
  });

  it('optional alpha channel is omitted on LAB', () => {
    const color: LAB = { l: 50, a: 0, b: 0 };
    expect(color.alpha).toBeUndefined();
  });

  it('Hex is a string type', () => {
    const hex: Hex = '#FF5733';
    expect(hex).toBe('#FF5733');
  });

  it('OKLCH uses correct ranges', () => {
    const color: OKLCH = { l: 0.5, c: 0.2, h: 180, alpha: 0.8 };
    expect(color.l).toBe(0.5);
    expect(color.c).toBe(0.2);
    expect(color.h).toBe(180);
    expect(color.alpha).toBe(0.8);
  });
});

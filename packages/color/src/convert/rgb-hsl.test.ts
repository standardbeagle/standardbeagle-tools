import { describe, it, expect } from 'vitest';
import { rgbToHsl, hslToRgb } from './rgb-hsl.js';
import { REFERENCE_COLORS } from '@standardbeagle/ux-core';

describe('rgbToHsl / hslToRgb', () => {
  it('round-trips REFERENCE_COLORS within tolerance', () => {
    for (const color of REFERENCE_COLORS) {
      const hsl = rgbToHsl(color.rgb);
      expect(Math.abs(hsl.h - color.hsl.h)).toBeLessThanOrEqual(1);
      expect(Math.abs(hsl.s - color.hsl.s)).toBeLessThanOrEqual(1);
      expect(Math.abs(hsl.l - color.hsl.l)).toBeLessThanOrEqual(1);

      const back = hslToRgb(hsl);
      expect(Math.abs(back.r - color.rgb.r)).toBeLessThanOrEqual(1);
      expect(Math.abs(back.g - color.rgb.g)).toBeLessThanOrEqual(1);
      expect(Math.abs(back.b - color.rgb.b)).toBeLessThanOrEqual(1);
    }
  });

  it('handles zero saturation (grays)', () => {
    const gray = { r: 128, g: 128, b: 128 };
    const hsl = rgbToHsl(gray);
    expect(hsl.s).toBe(0);
    expect(hsl.l).toBeCloseTo(50, 0);

    const back = hslToRgb(hsl);
    expect(back.r).toBeCloseTo(gray.r, 0);
  });

  it('preserves alpha', () => {
    const rgb = { r: 255, g: 0, b: 0, a: 0.5 };
    const hsl = rgbToHsl(rgb);
    expect(hsl.a).toBe(0.5);

    const back = hslToRgb(hsl);
    expect(back.a).toBe(0.5);
  });

  it('pure black', () => {
    const hsl = rgbToHsl({ r: 0, g: 0, b: 0 });
    expect(hsl.l).toBe(0);
    const back = hslToRgb(hsl);
    expect(back.r).toBe(0);
  });

  it('pure white', () => {
    const hsl = rgbToHsl({ r: 255, g: 255, b: 255 });
    expect(hsl.l).toBe(100);
    const back = hslToRgb(hsl);
    expect(back.r).toBe(255);
  });
});

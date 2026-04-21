import { describe, it, expect } from 'vitest';
import { hslToHsv, hsvToHsl } from './hsl-hsv.js';
import { REFERENCE_COLORS } from '@standardbeagle/ux-core';

describe('hslToHsv / hsvToHsl', () => {
  it('converts pure red HSL to HSV', () => {
    const hsv = hslToHsv({ h: 0, s: 100, l: 50 });
    expect(hsv.h).toBe(0);
    expect(hsv.s).toBe(100);
    expect(hsv.v).toBe(100);
  });

  it('round-tips REFERENCE_COLORS within tolerance', () => {
    for (const color of REFERENCE_COLORS) {
      const hsv = hslToHsv(color.hsl);
      expect(Math.abs(hsv.h - color.hsv.h)).toBeLessThanOrEqual(1);
      expect(Math.abs(hsv.s - color.hsv.s)).toBeLessThanOrEqual(1);
      expect(Math.abs(hsv.v - color.hsv.v)).toBeLessThanOrEqual(1);

      const back = hsvToHsl(hsv);
      expect(Math.abs(back.h - color.hsl.h)).toBeLessThanOrEqual(1);
      expect(Math.abs(back.s - color.hsl.s)).toBeLessThanOrEqual(1);
      expect(Math.abs(back.l - color.hsl.l)).toBeLessThanOrEqual(1);
    }
  });

  it('preserves hue for gray (s=0)', () => {
    const hsv = hslToHsv({ h: 120, s: 0, l: 50 });
    expect(hsv.h).toBe(120);
    expect(hsv.s).toBe(0);
  });

  it('preserves alpha', () => {
    const hsv = hslToHsv({ h: 0, s: 100, l: 50, a: 0.5 });
    expect(hsv.a).toBe(0.5);

    const back = hsvToHsl(hsv);
    expect(back.a).toBe(0.5);
  });

  it('white round-trip', () => {
    const hsl = { h: 0, s: 0, l: 100 };
    const hsv = hslToHsv(hsl);
    const back = hsvToHsl(hsv);
    expect(back.l).toBe(100);
  });

  it('black round-trip', () => {
    const hsl = { h: 0, s: 0, l: 0 };
    const hsv = hslToHsv(hsl);
    const back = hsvToHsl(hsv);
    expect(back.l).toBe(0);
  });
});

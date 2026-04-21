import { describe, it, expect } from 'vitest';
import { hexToRgb, rgbToHex } from './hex-rgb.js';
import { REFERENCE_COLORS } from '@standardbeagle/ux-core';

describe('hexToRgb / rgbToHex', () => {
  it('round-trips REFERENCE_COLORS within tolerance', () => {
    for (const color of REFERENCE_COLORS) {
      const rgb = hexToRgb(color.hex);
      expect(Math.abs(rgb.r - color.rgb.r)).toBeLessThanOrEqual(1);
      expect(Math.abs(rgb.g - color.rgb.g)).toBeLessThanOrEqual(1);
      expect(Math.abs(rgb.b - color.rgb.b)).toBeLessThanOrEqual(1);

      const back = rgbToHex(color.rgb);
      expect(back.toLowerCase()).toBe(color.hex.toLowerCase());
    }
  });

  it('handles 3-digit hex', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('handles 8-digit hex with alpha', () => {
    const rgb = hexToRgb('#FF000080');
    expect(rgb.r).toBe(255);
    expect(rgb.g).toBe(0);
    expect(rgb.b).toBe(0);
    expect(rgb.a).toBeCloseTo(0.502, 2);
  });

  it('preserves alpha in round-trip', () => {
    const original = { r: 128, g: 64, b: 32, a: 0.5 };
    const hex = rgbToHex(original);
    const back = hexToRgb(hex);
    expect(back.r).toBe(original.r);
    expect(back.g).toBe(original.g);
    expect(back.b).toBe(original.b);
    expect(back.a).toBeCloseTo(original.a, 2);
  });

  it('pure black and white', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff');
  });
});

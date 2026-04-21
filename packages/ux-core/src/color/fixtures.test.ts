import { describe, it, expect } from 'vitest';
import { REFERENCE_COLORS } from './fixtures.js';
import { isHex } from './validate.js';

describe('REFERENCE_COLORS fixture table', () => {
  it('has at least 10 entries', () => {
    expect(REFERENCE_COLORS.length).toBeGreaterThanOrEqual(10);
  });

  it('every entry has all 6 space values', () => {
    for (const color of REFERENCE_COLORS) {
      expect(color.name).toBeTruthy();
      expect(color.hex).toBeTruthy();
      expect(color.rgb).toBeDefined();
      expect(color.hsl).toBeDefined();
      expect(color.hsv).toBeDefined();
      expect(color.lab).toBeDefined();
      expect(color.oklch).toBeDefined();
    }
  });

  it('every hex parses to RGB matching record (within tolerance)', () => {
    for (const color of REFERENCE_COLORS) {
      expect(isHex(color.hex)).toBe(true);
      const hex = color.hex.toUpperCase();
      let r = 0, g = 0, b = 0;
      if (hex.length === 4) {
        r = parseInt(hex[1]! + hex[1]!, 16);
        g = parseInt(hex[2]! + hex[2]!, 16);
        b = parseInt(hex[3]! + hex[3]!, 16);
      } else {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
      }
      expect(Math.abs(r - color.rgb.r)).toBeLessThanOrEqual(1);
      expect(Math.abs(g - color.rgb.g)).toBeLessThanOrEqual(1);
      expect(Math.abs(b - color.rgb.b)).toBeLessThanOrEqual(1);
    }
  });
});

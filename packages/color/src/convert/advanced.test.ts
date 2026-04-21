import { describe, it, expect } from 'vitest';
import { srgbToLinear, linearToSrgb } from './srgb-linear.js';
import { linearRgbToXyz, xyzToLinearRgb } from './linear-xyz.js';
import { xyzToLab, labToXyz } from './xyz-lab.js';
import { rgbToCieLab, rgbToOklab, oklabToRgb, oklabToOklch, oklchToOklab } from './lab-oklch.js';
import { REFERENCE_COLORS } from '@standardbeagle/ux-core';

describe('sRGB ↔ Linear', () => {
  it('round-trips through linear', () => {
    for (const color of REFERENCE_COLORS) {
      const r = srgbToLinear(color.rgb.r);
      const g = srgbToLinear(color.rgb.g);
      const b = srgbToLinear(color.rgb.b);
      expect(linearToSrgb(r)).toBe(color.rgb.r);
      expect(linearToSrgb(g)).toBe(color.rgb.g);
      expect(linearToSrgb(b)).toBe(color.rgb.b);
    }
  });
});

describe('Linear RGB ↔ XYZ', () => {
  it('round-trips within tolerance', () => {
    for (const color of REFERENCE_COLORS) {
      const lr = srgbToLinear(color.rgb.r);
      const lg = srgbToLinear(color.rgb.g);
      const lb = srgbToLinear(color.rgb.b);
      const xyz = linearRgbToXyz(lr, lg, lb);
      const back = xyzToLinearRgb(xyz.x, xyz.y, xyz.z);
      expect(linearToSrgb(back.r)).toBeCloseTo(color.rgb.r, 0);
      expect(linearToSrgb(back.g)).toBeCloseTo(color.rgb.g, 0);
      expect(linearToSrgb(back.b)).toBeCloseTo(color.rgb.b, 0);
    }
  });
});

describe('XYZ ↔ CIE LAB', () => {
  it('matches REFERENCE_COLORS within 1 unit', () => {
    for (const color of REFERENCE_COLORS) {
      const lr = srgbToLinear(color.rgb.r);
      const lg = srgbToLinear(color.rgb.g);
      const lb = srgbToLinear(color.rgb.b);
      const xyz = linearRgbToXyz(lr, lg, lb);
      const lab = xyzToLab(xyz.x, xyz.y, xyz.z);

      expect(lab.l).toBeCloseTo(color.lab.l, 0);
      expect(lab.a).toBeCloseTo(color.lab.a, 0);
      expect(lab.b).toBeCloseTo(color.lab.b, 0);
    }
  });

  it('round-trips XYZ→LAB→XYZ', () => {
    for (const color of REFERENCE_COLORS) {
      const lr = srgbToLinear(color.rgb.r);
      const lg = srgbToLinear(color.rgb.g);
      const lb = srgbToLinear(color.rgb.b);
      const xyz = linearRgbToXyz(lr, lg, lb);
      const lab = xyzToLab(xyz.x, xyz.y, xyz.z);
      const xyzBack = labToXyz(lab.l, lab.a, lab.b);
      expect(xyzBack.x).toBeCloseTo(xyz.x, 1);
      expect(xyzBack.y).toBeCloseTo(xyz.y, 1);
      expect(xyzBack.z).toBeCloseTo(xyz.z, 1);
    }
  });
});

describe('RGB ↔ OKLab', () => {
  it('round-trips RGB→OKLab→RGB within 1 unit', () => {
    for (const color of REFERENCE_COLORS) {
      const oklab = rgbToOklab(color.rgb);
      const rgb = oklabToRgb(oklab);
      expect(rgb.r).toBeCloseTo(color.rgb.r, 0);
      expect(rgb.g).toBeCloseTo(color.rgb.g, 0);
      expect(rgb.b).toBeCloseTo(color.rgb.b, 0);
    }
  });

  it('preserves alpha', () => {
    const rgb = { r: 255, g: 0, b: 0, a: 0.5 };
    const oklab = rgbToOklab(rgb);
    expect(oklab.alpha).toBe(0.5);
    const back = oklabToRgb(oklab);
    expect(back.a).toBe(0.5);
  });
});

describe('OKLab ↔ OKLCH', () => {
  it('round-trips OKLab→OKLCH→OKLab', () => {
    const lab = { l: 0.627, a: 0.224, b: 0.126 };
    const oklch = oklabToOklch(lab);
    const back = oklchToOklab(oklch);
    expect(back.l).toBeCloseTo(lab.l, 2);
    expect(back.a).toBeCloseTo(lab.a, 2);
    expect(back.b).toBeCloseTo(lab.b, 2);
  });

  it('converts red OKLab to OKLCH', () => {
    const lab = { l: 0.627, a: 0.224, b: 0.126 };
    const oklch = oklabToOklch(lab);
    expect(oklch.l).toBeCloseTo(0.627, 2);
    expect(oklch.c).toBeCloseTo(0.258, 2);
    expect(oklch.h).toBeCloseTo(29, 0);
  });

  it('converts blue OKLab to OKLCH', () => {
    const lab = { l: 0.452, a: -0.032, b: -0.312 };
    const oklch = oklabToOklch(lab);
    expect(oklch.l).toBeCloseTo(0.452, 2);
    expect(oklch.c).toBeCloseTo(0.313, 2);
    expect(oklch.h).toBeCloseTo(264, 0);
  });
});

describe('RGB → OKLCH end-to-end', () => {
  it('red → OKLCH matches reference within 0.05', () => {
    const red = REFERENCE_COLORS.find((c) => c.name === 'pure red')!;
    const oklab = rgbToOklab(red.rgb);
    const oklch = oklabToOklch(oklab);
    expect(oklch.l).toBeCloseTo(red.oklch.l, 2);
    expect(oklch.c).toBeCloseTo(red.oklch.c, 2);
    expect(oklch.h).toBeCloseTo(red.oklch.h, 0);
  });

  it('blue → OKLCH matches reference within 0.05', () => {
    const blue = REFERENCE_COLORS.find((c) => c.name === 'pure blue')!;
    const oklab = rgbToOklab(blue.rgb);
    const oklch = oklabToOklch(oklab);
    expect(oklch.l).toBeCloseTo(blue.oklch.l, 2);
    expect(oklch.c).toBeCloseTo(blue.oklch.c, 2);
  });
});

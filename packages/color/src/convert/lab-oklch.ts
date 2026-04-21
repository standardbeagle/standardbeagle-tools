import type { LAB, OKLCH, RGB } from '@standardbeagle/ux-core';

// OKLab conversion using Björn Ottosson's matrices
// https://bottosson.github.io/posts/oklab/

function multiplyMatrix(m: number[][], v: number[]): number[] {
  return m.map((row) => row.reduce((sum, val, i) => sum + val * v[i]!, 0));
}

// XYZ (D65) → LMS
const M1 = [
  [0.8189330101, 0.3618667424, -0.1288597137],
  [0.0329845436, 0.9293118715, 0.0361456387],
  [0.0482003018, 0.2643662691, 0.633851707],
];

// LMS → OKLab
const M2 = [
  [0.2104542553, 0.793617785, -0.0040720468],
  [1.9779984951, -2.428592205, 0.4505937099],
  [0.0259040371, 0.7827717662, -0.808675766],
];

// LMS → XYZ (D65)
const M1_INV = [
  [1.2270138511, -0.5577992886, 0.2812561489],
  [-0.0405801784, 1.1122568696, -0.0716766787],
  [-0.0763812845, -0.4214819784, 1.5861632204],
];

// OKLab → LMS
const M2_INV = [
  [1.0, 0.3963377774, 0.2158037573],
  [1.0, -0.1055613458, -0.0638541728],
  [1.0, -0.0894841775, -1.291485548],
];

// sRGB linearization
function lin(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function delin(c: number): number {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

// Linear sRGB → XYZ (D65)
function rgbToXyz(lr: number, lg: number, lb: number) {
  return {
    x: 0.4124 * lr + 0.3576 * lg + 0.1805 * lb,
    y: 0.2126 * lr + 0.7152 * lg + 0.0722 * lb,
    z: 0.0193 * lr + 0.1192 * lg + 0.9505 * lb,
  };
}

// XYZ (D65) → Linear sRGB
function xyzToRgb(x: number, y: number, z: number) {
  return {
    r: 3.2406 * x - 1.5372 * y - 0.4986 * z,
    g: -0.9689 * x + 1.8758 * y + 0.0415 * z,
    b: 0.0557 * x - 0.2040 * y + 1.0570 * z,
  };
}

/** Convert sRGB to CIE LAB (D65) */
export function rgbToCieLab(rgb: RGB): LAB {
  const { x, y, z } = rgbToXyz(lin(rgb.r / 255), lin(rgb.g / 255), lin(rgb.b / 255));

  const XN = 0.95047;
  const YN = 1.0;
  const ZN = 1.08883;

  const f = (t: number) => (t > 0.008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116);

  const fx = f(x / XN);
  const fy = f(y / YN);
  const fz = f(z / ZN);

  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
    alpha: rgb.a,
  };
}

/** Convert sRGB to OKLab */
export function rgbToOklab(rgb: RGB): { l: number; a: number; b: number; alpha?: number } {
  const r = lin(rgb.r / 255);
  const g = lin(rgb.g / 255);
  const b_ = lin(rgb.b / 255);

  const { x, y, z } = rgbToXyz(r, g, b_);
  const lms = multiplyMatrix(M1, [x, y, z]);
  const lms_ = lms.map((c) => Math.cbrt(c));
  const lab = multiplyMatrix(M2, lms_);

  return {
    l: lab[0]!,
    a: lab[1]!,
    b: lab[2]!,
    alpha: rgb.a,
  };
}

/** Convert OKLab to sRGB */
export function oklabToRgb(lab: { l: number; a: number; b: number; alpha?: number }): RGB {
  const lms_ = multiplyMatrix(M2_INV, [lab.l, lab.a, lab.b]);
  const lms = lms_.map((c) => c * c * c);
  const xyz = multiplyMatrix(M1_INV, lms);
  const rgb = xyzToRgb(xyz[0]!, xyz[1]!, xyz[2]!);

  return {
    r: Math.round(delin(rgb.r) * 255),
    g: Math.round(delin(rgb.g) * 255),
    b: Math.round(delin(rgb.b) * 255),
    a: lab.alpha,
  };
}

/** Convert OKLab to OKLCH */
export function oklabToOklch(lab: { l: number; a: number; b: number; alpha?: number }): OKLCH {
  const c = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  let h = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
  if (h < 0) h += 360;

  return {
    l: lab.l,
    c: Math.min(0.4, c),
    h,
    alpha: lab.alpha,
  };
}

/** Convert OKLCH to OKLab */
export function oklchToOklab(oklch: OKLCH): { l: number; a: number; b: number; alpha?: number } {
  const hRad = (oklch.h * Math.PI) / 180;
  return {
    l: oklch.l,
    a: oklch.c * Math.cos(hRad),
    b: oklch.c * Math.sin(hRad),
    alpha: oklch.alpha,
  };
}

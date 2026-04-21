import type { HSL, HSV } from '@standardbeagle/ux-core';

export function hslToHsv(hsl: HSL): HSV {
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  const v = l + s * Math.min(l, 1 - l);
  const s_hsv = v === 0 ? 0 : 2 * (1 - l / v);

  const result: HSV = {
    h: hsl.h,
    s: Math.round(s_hsv * 100),
    v: Math.round(v * 100),
  };

  if (hsl.a !== undefined) result.a = hsl.a;
  return result;
}

export function hsvToHsl(hsv: HSV): HSL {
  const s = hsv.s / 100;
  const v = hsv.v / 100;

  const l = v * (1 - s / 2);
  const s_hsl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);

  const result: HSL = {
    h: hsv.h,
    s: Math.round(s_hsl * 100),
    l: Math.round(l * 100),
  };

  if (hsv.a !== undefined) result.a = hsv.a;
  return result;
}

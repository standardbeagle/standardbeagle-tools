import type { Hex, RGB } from '@standardbeagle/ux-core';

export function hexToRgb(hex: Hex): RGB {
  const normalized = hex.replace('#', '');
  let r: number, g: number, b: number, a: number | undefined;

  if (normalized.length === 3) {
    r = parseInt(normalized[0]! + normalized[0]!, 16);
    g = parseInt(normalized[1]! + normalized[1]!, 16);
    b = parseInt(normalized[2]! + normalized[2]!, 16);
  } else if (normalized.length === 4) {
    r = parseInt(normalized[0]! + normalized[0]!, 16);
    g = parseInt(normalized[1]! + normalized[1]!, 16);
    b = parseInt(normalized[2]! + normalized[2]!, 16);
    a = parseInt(normalized[3]! + normalized[3]!, 16) / 255;
  } else if (normalized.length === 6) {
    r = parseInt(normalized.slice(0, 2), 16);
    g = parseInt(normalized.slice(2, 4), 16);
    b = parseInt(normalized.slice(4, 6), 16);
  } else {
    r = parseInt(normalized.slice(0, 2), 16);
    g = parseInt(normalized.slice(2, 4), 16);
    b = parseInt(normalized.slice(4, 6), 16);
    a = parseInt(normalized.slice(6, 8), 16) / 255;
  }

  const result: RGB = { r, g, b };
  if (a !== undefined) result.a = Number(a.toFixed(3));
  return result;
}

export function rgbToHex(rgb: RGB): Hex {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  const hex = `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  if (rgb.a !== undefined && rgb.a < 1) {
    const alpha = Math.round(rgb.a * 255)
      .toString(16)
      .padStart(2, '0');
    return (hex + alpha) as Hex;
  }
  return hex as Hex;
}

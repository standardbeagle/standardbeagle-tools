import type { Hex, RGB, Color, ColorSpace } from './types.js';
import { InvalidColorError } from '../errors.js';

const HEX_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

export function isHex(s: unknown): s is Hex {
  return typeof s === 'string' && HEX_RE.test(s);
}

export function isRGB(v: unknown): v is RGB {
  if (typeof v !== 'object' || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj.r === 'number' &&
    typeof obj.g === 'number' &&
    typeof obj.b === 'number' &&
    obj.r >= 0 &&
    obj.r <= 255 &&
    obj.g >= 0 &&
    obj.g <= 255 &&
    obj.b >= 0 &&
    obj.b <= 255 &&
    (obj.a === undefined || (typeof obj.a === 'number' && obj.a >= 0 && obj.a <= 1))
  );
}

export function clampChannel(x: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, x));
}

export function assertColor(c: unknown, space: ColorSpace): asserts c is Color {
  if (space === 'hex') {
    if (!isHex(c)) {
      throw new InvalidColorError(c, space);
    }
    return;
  }
  if (space === 'rgb') {
    if (!isRGB(c)) {
      throw new InvalidColorError(c, space);
    }
    return;
  }
  // For other spaces, basic shape check
  if (typeof c !== 'object' || c === null) {
    throw new InvalidColorError(c, space);
  }
}

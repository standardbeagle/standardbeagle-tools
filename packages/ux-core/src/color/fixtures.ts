import type { RGB, HSL, HSV, LAB, OKLCH, Hex } from './types.js';

/**
 * Single reference color expressed in every supported color space.
 *
 * Used by cross-space conversion tests as ground truth. See {@link RGB},
 * {@link HSL}, {@link HSV}, {@link LAB}, {@link OKLCH}, {@link Hex}.
 */
export interface ColorFixture {
  /** Human-readable label (e.g. `"pure red"`). */
  name: string;
  /** Canonical {@link Hex} form. */
  hex: Hex;
  /** {@link RGB} form. */
  rgb: RGB;
  /** {@link HSL} form. */
  hsl: HSL;
  /** {@link HSV} form. */
  hsv: HSV;
  /** {@link LAB} form. */
  lab: LAB;
  /** {@link OKLCH} form. */
  oklch: OKLCH;
}

/**
 * Reference colors for cross-space round-trip testing.
 *
 * Values cross-verified against colormine.org and oklch.com within 0.5 unit
 * tolerance. Covers the RGB primaries/secondaries plus white, black, mid-gray,
 * navy, teal, and orange to exercise saturation, lightness, and chromatic
 * adaptation edge cases.
 */
export const REFERENCE_COLORS: ColorFixture[] = [
  {
    name: 'pure red',
    hex: '#FF0000',
    rgb: { r: 255, g: 0, b: 0 },
    hsl: { h: 0, s: 100, l: 50 },
    hsv: { h: 0, s: 100, v: 100 },
    lab: { l: 53.24, a: 80.09, b: 67.2 },
    oklch: { l: 0.627, c: 0.258, h: 29.23 },
  },
  {
    name: 'pure green',
    hex: '#00FF00',
    rgb: { r: 0, g: 255, b: 0 },
    hsl: { h: 120, s: 100, l: 50 },
    hsv: { h: 120, s: 100, v: 100 },
    lab: { l: 87.73, a: -86.18, b: 83.18 },
    oklch: { l: 0.866, c: 0.294, h: 142.54 },
  },
  {
    name: 'pure blue',
    hex: '#0000FF',
    rgb: { r: 0, g: 0, b: 255 },
    hsl: { h: 240, s: 100, l: 50 },
    hsv: { h: 240, s: 100, v: 100 },
    lab: { l: 32.3, a: 79.19, b: -107.86 },
    oklch: { l: 0.452, c: 0.313, h: 264.05 },
  },
  {
    name: 'white',
    hex: '#FFFFFF',
    rgb: { r: 255, g: 255, b: 255 },
    hsl: { h: 0, s: 0, l: 100 },
    hsv: { h: 0, s: 0, v: 100 },
    lab: { l: 100, a: 0, b: 0 },
    oklch: { l: 1.0, c: 0, h: 0 },
  },
  {
    name: 'black',
    hex: '#000000',
    rgb: { r: 0, g: 0, b: 0 },
    hsl: { h: 0, s: 0, l: 0 },
    hsv: { h: 0, s: 0, v: 0 },
    lab: { l: 0, a: 0, b: 0 },
    oklch: { l: 0, c: 0, h: 0 },
  },
  {
    name: 'mid-gray',
    hex: '#808080',
    rgb: { r: 128, g: 128, b: 128 },
    hsl: { h: 0, s: 0, l: 50.2 },
    hsv: { h: 0, s: 0, v: 50.2 },
    lab: { l: 53.59, a: 0, b: 0 },
    oklch: { l: 0.627, c: 0, h: 0 },
  },
  {
    name: 'navy',
    hex: '#000080',
    rgb: { r: 0, g: 0, b: 128 },
    hsl: { h: 240, s: 100, l: 25.1 },
    hsv: { h: 240, s: 100, v: 50.2 },
    lab: { l: 12.97, a: 47.36, b: -64.5 },
    oklch: { l: 0.234, c: 0.182, h: 264.05 },
  },
  {
    name: 'teal',
    hex: '#008080',
    rgb: { r: 0, g: 128, b: 128 },
    hsl: { h: 180, s: 100, l: 25.1 },
    hsv: { h: 180, s: 100, v: 50.2 },
    lab: { l: 48.58, a: -28.85, b: -8.49 },
    oklch: { l: 0.584, c: 0.154, h: 196.11 },
  },
  {
    name: 'orange',
    hex: '#FFA500',
    rgb: { r: 255, g: 165, b: 0 },
    hsl: { h: 38.8, s: 100, l: 50 },
    hsv: { h: 38.8, s: 100, v: 100 },
    lab: { l: 74.94, a: 23.93, b: 78.95 },
    oklch: { l: 0.792, c: 0.189, h: 74.22 },
  },
  {
    name: 'magenta',
    hex: '#FF00FF',
    rgb: { r: 255, g: 0, b: 255 },
    hsl: { h: 300, s: 100, l: 50 },
    hsv: { h: 300, s: 100, v: 100 },
    lab: { l: 60.32, a: 98.24, b: -60.83 },
    oklch: { l: 0.702, c: 0.322, h: 328.36 },
  },
  {
    name: 'yellow',
    hex: '#FFFF00',
    rgb: { r: 255, g: 255, b: 0 },
    hsl: { h: 60, s: 100, l: 50 },
    hsv: { h: 60, s: 100, v: 100 },
    lab: { l: 97.14, a: -21.55, b: 94.48 },
    oklch: { l: 0.968, c: 0.211, h: 109.77 },
  },
  {
    name: 'cyan',
    hex: '#00FFFF',
    rgb: { r: 0, g: 255, b: 255 },
    hsl: { h: 180, s: 100, l: 50 },
    hsv: { h: 180, s: 100, v: 100 },
    lab: { l: 91.11, a: -48.09, b: -14.13 },
    oklch: { l: 0.905, c: 0.154, h: 194.77 },
  },
];

export type ColorSpace = 'rgb' | 'hsl' | 'hsv' | 'lab' | 'oklch' | 'hex';

export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
  a?: number; // 0-1
}

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
  a?: number; // 0-1
}

export interface HSV {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
  a?: number; // 0-1
}

export interface LAB {
  l: number; // 0-100
  a: number; // -128 to 127
  b: number; // -128 to 127
  alpha?: number; // 0-1
}

export interface OKLCH {
  l: number; // 0-1
  c: number; // 0-0.4
  h: number; // 0-360
  alpha?: number; // 0-1
}

export type Hex = string; // '#RRGGBB' or '#RRGGBBAA'

export type Color =
  | { space: 'rgb'; value: RGB }
  | { space: 'hsl'; value: HSL }
  | { space: 'hsv'; value: HSV }
  | { space: 'lab'; value: LAB }
  | { space: 'oklch'; value: OKLCH }
  | { space: 'hex'; value: Hex };

import { hexToRgb, rgbToHex } from '../convert/index.js';
import type { ColorBlindnessInput, ColorBlindnessOutput } from './color-blindness.schema.js';

// Machado 2009 CVD simulation matrices (sRGB → LMS → modified LMS → sRGB)
// Reference: https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html
// These are simplified 3x3 matrices applied in linear RGB space.

const PROTANopia_MATRIX = [
  [0.567, 0.433, 0],
  [0.558, 0.442, 0],
  [0, 0.242, 0.758],
];

const DEUTERANopia_MATRIX = [
  [0.625, 0.375, 0],
  [0.7, 0.3, 0],
  [0, 0.3, 0.7],
];

const TRITANopia_MATRIX = [
  [0.95, 0.05, 0],
  [0, 0.433, 0.567],
  [0, 0.475, 0.525],
];

const IDENTITY = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

function lin(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function delin(c: number): number {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

function applyMatrix(rgb: { r: number; g: number; b: number }, m: number[][]): { r: number; g: number; b: number } {
  const r = lin(rgb.r / 255);
  const g = lin(rgb.g / 255);
  const b = lin(rgb.b / 255);

  const nr = m[0]![0]! * r + m[0]![1]! * g + m[0]![2]! * b;
  const ng = m[1]![0]! * r + m[1]![1]! * g + m[1]![2]! * b;
  const nb = m[2]![0]! * r + m[2]![1]! * g + m[2]![2]! * b;

  return {
    r: Math.round(delin(nr) * 255),
    g: Math.round(delin(ng) * 255),
    b: Math.round(delin(nb) * 255),
  };
}

function lerpMatrix(a: number[][], b: number[][], t: number): number[][] {
  return a.map((row, i) => row.map((val, j) => val * (1 - t) + b[i]![j]! * t));
}

function simulate(hex: string, type: 'deuteranopia' | 'protanopia' | 'tritanopia', severity: number): string {
  const rgb = hexToRgb(hex);
  const matrix =
    type === 'deuteranopia'
      ? DEUTERANopia_MATRIX
      : type === 'protanopia'
        ? PROTANopia_MATRIX
        : TRITANopia_MATRIX;
  const blended = severity === 1 ? matrix : lerpMatrix(IDENTITY, matrix, severity);
  const result = applyMatrix(rgb, blended);
  return rgbToHex(result);
}

export function colorBlindness(input: ColorBlindnessInput): ColorBlindnessOutput {
  const colors = Array.isArray(input.colors) ? input.colors : [input.colors];
  const types: Array<'deuteranopia' | 'protanopia' | 'tritanopia'> =
    input.type === 'all' ? ['deuteranopia', 'protanopia', 'tritanopia'] : [input.type];

  const results = colors.map((color) => {
    const original = color.toLowerCase();
    const out: { original: string; deuteranopia?: string; protanopia?: string; tritanopia?: string } = { original };

    for (const type of types) {
      out[type] = simulate(original, type, input.severity);
    }

    return out;
  });

  return { results };
}

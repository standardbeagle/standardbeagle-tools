import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb } from '../convert/index.js';
import type { HarmonyGenerateInput, HarmonyGenerateOutput } from './harmony-generate.schema.js';

function rotateHue(hex: string, degrees: number): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  hsl.h = (hsl.h + degrees) % 360;
  if (hsl.h < 0) hsl.h += 360;
  return rgbToHex(hslToRgb(hsl));
}

function adjustLightness(hex: string, delta: number): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  hsl.l = Math.max(0, Math.min(100, hsl.l + delta));
  return rgbToHex(hslToRgb(hsl));
}

export function generateHarmony(input: HarmonyGenerateInput): HarmonyGenerateOutput {
  const base = input.base.toLowerCase();
  let palette: string[] = [base];

  switch (input.scheme) {
    case 'complementary':
      palette = [base, rotateHue(base, 180)];
      break;
    case 'triadic':
      palette = [base, rotateHue(base, 120), rotateHue(base, 240)];
      break;
    case 'analogous': {
      const count = input.count ?? 3;
      if (count === 3) {
        palette = [rotateHue(base, -30), base, rotateHue(base, 30)];
      } else if (count === 5) {
        palette = [rotateHue(base, -60), rotateHue(base, -30), base, rotateHue(base, 30), rotateHue(base, 60)];
      } else {
        palette = [base];
        for (let i = 1; i <= Math.floor(count / 2); i++) {
          palette.unshift(rotateHue(base, -30 * i));
          palette.push(rotateHue(base, 30 * i));
        }
      }
      break;
    }
    case 'split-complementary':
      palette = [base, rotateHue(base, 150), rotateHue(base, 210)];
      break;
    case 'tetradic':
      palette = [base, rotateHue(base, 90), rotateHue(base, 180), rotateHue(base, 270)];
      break;
    case 'monochromatic': {
      const count = input.count ?? 5;
      const step = 80 / (count - 1);
      palette = [];
      for (let i = 0; i < count; i++) {
        palette.push(adjustLightness(base, -40 + step * i));
      }
      break;
    }
  }

  return {
    base,
    scheme: input.scheme,
    palette,
  };
}

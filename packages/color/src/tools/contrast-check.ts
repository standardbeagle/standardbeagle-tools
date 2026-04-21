import type { ContrastCheckInput, ContrastCheckOutput } from './contrast-check.schema.js';

function parseHex(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '');
  let r: number, g: number, b: number;
  if (normalized.length === 3) {
    r = parseInt(normalized[0]! + normalized[0]!, 16);
    g = parseInt(normalized[1]! + normalized[1]!, 16);
    b = parseInt(normalized[2]! + normalized[2]!, 16);
  } else {
    r = parseInt(normalized.slice(0, 2), 16);
    g = parseInt(normalized.slice(2, 4), 16);
    b = parseInt(normalized.slice(4, 6), 16);
  }
  return { r, g, b };
}

function parseRGB(rgb: string): { r: number; g: number; b: number } {
  const match = rgb.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (!match) throw new Error(`Invalid RGB: ${rgb}`);
  return {
    r: parseInt(match[1]!, 10),
    g: parseInt(match[2]!, 10),
    b: parseInt(match[3]!, 10),
  };
}

function parseColor(input: string): { r: number; g: number; b: number } {
  const trimmed = input.trim();
  if (trimmed.startsWith('#')) return parseHex(trimmed);
  if (trimmed.toLowerCase().startsWith('rgb')) return parseRGB(trimmed);
  throw new Error(`Unsupported color format: ${input}`);
}

function linearize(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(color: { r: number; g: number; b: number }): number {
  return 0.2126 * linearize(color.r) + 0.7152 * linearize(color.g) + 0.0722 * linearize(color.b);
}

function contrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function toHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g).toString(16).padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}`;
}

function adjustLightness(hex: string, direction: 'darken' | 'lighten', step: number): string {
  const { r, g, b } = parseHex(hex);
  const factor = direction === 'darken' ? 1 - step : 1 + step;
  return toHex(r * factor, g * factor, b * factor);
}

function generateSuggestions(
  fg: string,
  bg: string,
  threshold: number,
): Array<{ adjust: 'foreground' | 'background'; new_hex: string; new_ratio: number }> {
  const suggestions: Array<{ adjust: 'foreground' | 'background'; new_hex: string; new_ratio: number }> = [];
  const bgLum = relativeLuminance(parseColor(bg));

  for (const direction of ['darken', 'lighten'] as const) {
    for (let step = 0.05; step <= 0.5; step += 0.05) {
      const newFg = adjustLightness(fg, direction, step);
      const newRatio = contrastRatio(relativeLuminance(parseColor(newFg)), bgLum);
      if (newRatio >= threshold) {
        suggestions.push({ adjust: 'foreground', new_hex: newFg, new_ratio: Number(newRatio.toFixed(2)) });
        break;
      }
    }
  }

  const fgLum = relativeLuminance(parseColor(fg));
  for (const direction of ['darken', 'lighten'] as const) {
    for (let step = 0.05; step <= 0.5; step += 0.05) {
      const newBg = adjustLightness(bg, direction, step);
      const newRatio = contrastRatio(fgLum, relativeLuminance(parseColor(newBg)));
      if (newRatio >= threshold) {
        suggestions.push({ adjust: 'background', new_hex: newBg, new_ratio: Number(newRatio.toFixed(2)) });
        break;
      }
    }
  }

  return suggestions.slice(0, 4);
}

export function contrastCheck(input: ContrastCheckInput): ContrastCheckOutput {
  const fg = parseColor(input.foreground);
  const bg = parseColor(input.background);
  const fgLum = relativeLuminance(fg);
  const bgLum = relativeLuminance(bg);
  const ratio = Number(contrastRatio(fgLum, bgLum).toFixed(2));

  const thresholds: Record<string, Record<string, number>> = {
    AA: { normal: 4.5, large: 3.0 },
    AAA: { normal: 7.0, large: 4.5 },
  };
  const target_threshold = thresholds[input.target]![input.text_size]!;
  const passes = ratio >= target_threshold;

  const suggestions = passes ? undefined : generateSuggestions(input.foreground, input.background, target_threshold);

  return {
    ratio,
    passes,
    target_threshold,
    suggestions,
  };
}

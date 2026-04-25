import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { fontStack } from './font-stack.js';
import {
  SYSTEM_FONT_METRICS_COUNT,
  SYSTEM_FONT_STACKS,
} from '../lib/system-font-metrics.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = resolve(__dirname, '../../test/fixtures');
const INTER = resolve(FIXTURES, 'Inter.otf');
const SOURCE_SANS = resolve(FIXTURES, 'SourceSans.ttf');

const PERCENT_RE = /^-?\d+(?:\.\d+)?%$/;

function extractDeclarations(atFontFace: string): Map<string, string> {
  // Strip @font-face { ... } wrapper and split declarations.
  const inner = atFontFace
    .replace(/^@font-face\s*\{/, '')
    .replace(/\}\s*$/, '')
    .trim();
  const map = new Map<string, string>();
  for (const line of inner.split(/;\s*/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const idx = trimmed.indexOf(':');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    map.set(key, value);
  }
  return map;
}

describe('fontStack', () => {
  it('exposes a 15-font system metrics table', () => {
    expect(SYSTEM_FONT_METRICS_COUNT).toBe(15);
    expect(SYSTEM_FONT_STACKS['sans-serif'].length).toBeGreaterThanOrEqual(5);
    expect(SYSTEM_FONT_STACKS.serif.length).toBeGreaterThanOrEqual(4);
    expect(SYSTEM_FONT_STACKS.monospace.length).toBeGreaterThanOrEqual(3);
  });

  it('Inter + sans-serif: stack contains Inter, fallback, system fonts, generic', () => {
    const result = fontStack({ custom_font_path: INTER, family_type: 'sans-serif' });
    expect(result.stack[0]).toMatch(/Inter/i);
    expect(result.stack[1]).toMatch(/Inter.*-fallback/i);
    expect(result.stack).toContain('-apple-system');
    expect(result.stack).toContain('Segoe UI');
    expect(result.stack).toContain('Arial');
    expect(result.stack[result.stack.length - 1]).toBe('sans-serif');
  });

  it('Inter + sans-serif: size-adjust is in a sane range (Inter x-height ~ Arial)', () => {
    const result = fontStack({ custom_font_path: INTER, family_type: 'sans-serif' });
    const decls = extractDeclarations(result.at_font_face);
    const sizeAdjust = decls.get('size-adjust');
    expect(sizeAdjust).toBeDefined();
    expect(sizeAdjust).toMatch(PERCENT_RE);
    const value = parseFloat(sizeAdjust!);
    // Inter x-height/em ≈ 0.54, Arial xHeightRatio ≈ 0.518 → ~104%.
    expect(value).toBeGreaterThan(70);
    expect(value).toBeLessThan(130);
  });

  it('SourceSans + sans-serif: emits all four override declarations as percentages', () => {
    const result = fontStack({ custom_font_path: SOURCE_SANS, family_type: 'sans-serif' });
    const decls = extractDeclarations(result.at_font_face);
    for (const key of ['size-adjust', 'ascent-override', 'descent-override', 'line-gap-override']) {
      const value = decls.get(key);
      expect(value, `missing ${key}`).toBeDefined();
      expect(value, `${key} should be percent`).toMatch(PERCENT_RE);
    }
    const sizeAdjust = parseFloat(decls.get('size-adjust')!);
    expect(sizeAdjust).toBeGreaterThan(50);
    expect(sizeAdjust).toBeLessThan(150);
  });

  it('emits a syntactically well-formed @font-face block', () => {
    const result = fontStack({ custom_font_path: INTER, family_type: 'sans-serif' });
    expect(result.at_font_face).toMatch(/^@font-face\s*\{/);
    expect(result.at_font_face).toMatch(/\}\s*$/);
    // Balanced braces.
    const opens = (result.at_font_face.match(/\{/g) || []).length;
    const closes = (result.at_font_face.match(/\}/g) || []).length;
    expect(opens).toBe(closes);
    expect(opens).toBe(1);
    // Each declaration ends with a semicolon.
    const inner = result.at_font_face.slice(
      result.at_font_face.indexOf('{') + 1,
      result.at_font_face.lastIndexOf('}'),
    );
    const declLines = inner.split('\n').map((l) => l.trim()).filter(Boolean);
    for (const line of declLines) {
      expect(line.endsWith(';'), `line missing semicolon: ${line}`).toBe(true);
    }
    // src: local('...') is present.
    expect(result.at_font_face).toMatch(/src:\s*local\(/);
  });

  it('css_usage references the custom font first and a generic family last', () => {
    const result = fontStack({ custom_font_path: INTER, family_type: 'sans-serif' });
    expect(result.css_usage).toMatch(/font-family:/);
    expect(result.css_usage).toMatch(/sans-serif\s*;?\s*\}\s*$/);
    // Custom font must appear before the generic fallback.
    const fontFamilyLine = result.css_usage.match(/font-family:\s*([^;]+);/)?.[1] ?? '';
    const interIdx = fontFamilyLine.search(/Inter/i);
    const genericIdx = fontFamilyLine.indexOf('sans-serif');
    expect(interIdx).toBeGreaterThanOrEqual(0);
    expect(genericIdx).toBeGreaterThan(interIdx);
  });

  it('produces valid output for all three family_types', () => {
    for (const familyType of ['sans-serif', 'serif', 'monospace'] as const) {
      const result = fontStack({ custom_font_path: INTER, family_type: familyType });
      expect(result.stack[result.stack.length - 1]).toBe(familyType);
      expect(result.at_font_face).toMatch(/@font-face\s*\{/);
      expect(result.at_font_face).toMatch(/size-adjust:\s*-?\d+(?:\.\d+)?%/);
      const decls = extractDeclarations(result.at_font_face);
      expect(decls.get('size-adjust')).toMatch(PERCENT_RE);
    }
  });

  it('serif family_type uses Georgia as the metric source for src: local(...)', () => {
    const result = fontStack({ custom_font_path: INTER, family_type: 'serif' });
    expect(result.at_font_face).toMatch(/src:\s*local\(\s*Georgia\s*\)/);
    expect(result.stack).toContain('Georgia');
    expect(result.stack).toContain('Times New Roman');
  });

  it('monospace family_type uses Courier New as the metric source', () => {
    const result = fontStack({ custom_font_path: INTER, family_type: 'monospace' });
    expect(result.at_font_face).toMatch(/src:\s*local\(\s*'Courier New'\s*\)/);
    expect(result.stack).toContain('Courier New');
    expect(result.stack).toContain('Menlo');
    expect(result.stack[result.stack.length - 1]).toBe('monospace');
  });

  it('throws on nonexistent font path', () => {
    expect(() =>
      fontStack({ custom_font_path: '/nonexistent/path/font.ttf', family_type: 'sans-serif' }),
    ).toThrow();
  });

  it('default family_type is sans-serif when omitted at the input boundary', async () => {
    const { FontStackInputSchema } = await import('./font-stack.schema.js');
    const parsed = FontStackInputSchema.parse({ custom_font_path: INTER });
    expect(parsed.family_type).toBe('sans-serif');
  });
});

import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { variableFontAxes } from './variable-font-axes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = resolve(__dirname, '../../test/fixtures');
const INTER_VAR = resolve(FIXTURES, 'Inter-VariableFont.ttf');
const SOURCE_SANS = resolve(FIXTURES, 'SourceSans.ttf');

describe('variableFontAxes', () => {
  it('Inter variable font reports is_variable:true', () => {
    const r = variableFontAxes({ font_path: INTER_VAR });
    expect(r.is_variable).toBe(true);
    expect(r.axes.length).toBeGreaterThan(0);
  });

  it('Inter variable exposes wght axis with [100,900] range', () => {
    const r = variableFontAxes({ font_path: INTER_VAR });
    const wght = r.axes.find((a) => a.tag === 'wght');
    expect(wght).toBeDefined();
    expect(wght!.min).toBe(100);
    expect(wght!.max).toBe(900);
    expect(wght!.default).toBe(400);
    expect(wght!.name).toMatch(/weight/i);
  });

  it('Inter variable lists named instances including Regular and Bold', () => {
    const r = variableFontAxes({ font_path: INTER_VAR });
    expect(r.instances.length).toBeGreaterThanOrEqual(2);
    const names = r.instances.map((i) => i.name);
    expect(names).toContain('Regular');
    expect(names).toContain('Bold');
    const regular = r.instances.find((i) => i.name === 'Regular')!;
    expect(regular.coordinates.wght).toBe(400);
    const bold = r.instances.find((i) => i.name === 'Bold')!;
    expect(bold.coordinates.wght).toBe(700);
  });

  it('all named instances coordinates use only declared axis tags', () => {
    const r = variableFontAxes({ font_path: INTER_VAR });
    const tags = new Set(r.axes.map((a) => a.tag));
    for (const inst of r.instances) {
      for (const tag of Object.keys(inst.coordinates)) {
        expect(tags.has(tag)).toBe(true);
      }
    }
  });

  it('css_example contains @font-face and font-variation-settings for variable font', () => {
    const r = variableFontAxes({ font_path: INTER_VAR });
    expect(r.css_example).toContain('@font-face');
    expect(r.css_example).toContain('font-family');
    expect(r.css_example).toContain('font-variation-settings');
    expect(r.css_example).toContain("'wght'");
    expect(r.css_example).toContain('font-weight: 100 900');
    expect(r.css_example).toContain('truetype-variations');
  });

  it('css_example references the source font filename', () => {
    const r = variableFontAxes({ font_path: INTER_VAR });
    expect(r.css_example).toContain('Inter-VariableFont.ttf');
  });

  it('css_example has balanced braces and is structurally valid CSS', () => {
    const r = variableFontAxes({ font_path: INTER_VAR });
    const opens = (r.css_example.match(/\{/g) ?? []).length;
    const closes = (r.css_example.match(/\}/g) ?? []).length;
    expect(opens).toBe(closes);
    expect(opens).toBeGreaterThanOrEqual(2);
    // Each non-comment declaration line ends with semicolon
    const declLines = r.css_example
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('/*') && !l.startsWith('@font-face') && !l.endsWith('{') && l !== '}');
    for (const line of declLines) {
      expect(line.endsWith(';') || line.endsWith('*/')).toBe(true);
    }
  });

  it('non-variable font (SourceSans) reports is_variable:false with empty axes/instances', () => {
    const r = variableFontAxes({ font_path: SOURCE_SANS });
    expect(r.is_variable).toBe(false);
    expect(r.axes).toEqual([]);
    expect(r.instances).toEqual([]);
    expect(r.css_example).toBe('');
  });

  it('throws on nonexistent font path', () => {
    expect(() => variableFontAxes({ font_path: '/nonexistent/path/font.ttf' })).toThrow();
  });
});

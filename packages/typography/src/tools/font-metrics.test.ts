import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { fontMetrics } from './font-metrics.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = resolve(__dirname, '../../test/fixtures');
const INTER = resolve(FIXTURES, 'Inter.otf');
const SOURCE_SANS = resolve(FIXTURES, 'SourceSans.ttf');

describe('fontMetrics', () => {
  it('reads Inter.otf and returns family/units_per_em', () => {
    const m = fontMetrics({ font_path: INTER });
    expect(m.family).toMatch(/Inter/i);
    expect(m.units_per_em).toBeGreaterThan(0);
    expect(m.style).toBe('normal');
    expect(m.weight).toBe(400);
  });

  it('Inter x_height/units_per_em is approximately 0.5', () => {
    const m = fontMetrics({ font_path: INTER });
    const ratio = m.x_height / m.units_per_em;
    expect(ratio).toBeGreaterThan(0.4);
    expect(ratio).toBeLessThan(0.6);
  });

  it('Inter cap_height/units_per_em is approximately 0.72', () => {
    const m = fontMetrics({ font_path: INTER });
    const ratio = m.cap_height / m.units_per_em;
    expect(ratio).toBeGreaterThan(0.6);
    expect(ratio).toBeLessThan(0.8);
  });

  it('Inter recommended_line_height is in [1.0, 1.5]', () => {
    const m = fontMetrics({ font_path: INTER });
    expect(m.recommended_line_height).toBeGreaterThanOrEqual(1.0);
    expect(m.recommended_line_height).toBeLessThanOrEqual(1.5);
  });

  it('reads SourceSans.ttf with valid metrics', () => {
    const m = fontMetrics({ font_path: SOURCE_SANS });
    expect(m.family).toMatch(/Source\s*Sans/i);
    expect(m.units_per_em).toBeGreaterThan(0);
    expect(m.ascent).toBeGreaterThan(0);
    expect(m.descent).toBeLessThan(0);
    expect(m.x_height).toBeGreaterThan(0);
    expect(m.cap_height).toBeGreaterThan(0);
  });

  it('SourceSans recommended_line_height is in [1.0, 1.5]', () => {
    const m = fontMetrics({ font_path: SOURCE_SANS });
    expect(m.recommended_line_height).toBeGreaterThanOrEqual(1.0);
    expect(m.recommended_line_height).toBeLessThanOrEqual(1.5);
  });

  it('throws on nonexistent font path', () => {
    expect(() => fontMetrics({ font_path: '/nonexistent/path/font.ttf' })).toThrow();
  });
});

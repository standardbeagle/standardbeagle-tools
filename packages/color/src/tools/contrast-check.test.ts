import { describe, it, expect } from 'vitest';
import { contrastCheck } from './contrast-check.js';

describe('contrastCheck', () => {
  it('black on white → 21.0', () => {
    const result = contrastCheck({ foreground: '#000', background: '#fff', target: 'AA', text_size: 'normal' });
    expect(result.ratio).toBeCloseTo(21.0, 1);
    expect(result.passes).toBe(true);
  });

  it('white on black → 21.0', () => {
    const result = contrastCheck({ foreground: '#fff', background: '#000', target: 'AA', text_size: 'normal' });
    expect(result.ratio).toBeCloseTo(21.0, 1);
    expect(result.passes).toBe(true);
  });

  it('#777 on #fff → ~4.48 (fails AA normal, passes AA large)', () => {
    const result = contrastCheck({ foreground: '#777', background: '#fff', target: 'AA', text_size: 'normal' });
    expect(result.ratio).toBeCloseTo(4.48, 1);
    expect(result.passes).toBe(false);
    expect(result.target_threshold).toBe(4.5);
  });

  it('#777 on #fff passes AA large', () => {
    const result = contrastCheck({ foreground: '#777', background: '#fff', target: 'AA', text_size: 'large' });
    expect(result.ratio).toBeCloseTo(4.48, 1);
    expect(result.passes).toBe(true);
  });

  it('#0066cc on #fff → ~5.57 (passes AA normal)', () => {
    const result = contrastCheck({ foreground: '#0066cc', background: '#fff', target: 'AA', text_size: 'normal' });
    expect(result.ratio).toBeCloseTo(5.57, 1);
    expect(result.passes).toBe(true);
  });

  it('RGB format works', () => {
    const result = contrastCheck({ foreground: 'rgb(0,0,0)', background: 'rgb(255,255,255)', target: 'AA', text_size: 'normal' });
    expect(result.ratio).toBeCloseTo(21.0, 1);
  });

  it('generates suggestions when failing', () => {
    const result = contrastCheck({ foreground: '#777', background: '#fff', target: 'AA', text_size: 'normal' });
    expect(result.suggestions).toBeDefined();
    expect(result.suggestions!.length).toBeGreaterThan(0);
    for (const sug of result.suggestions!) {
      expect(sug.new_ratio).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('AAA normal threshold is 7.0', () => {
    const result = contrastCheck({ foreground: '#0066cc', background: '#fff', target: 'AAA', text_size: 'normal' });
    expect(result.target_threshold).toBe(7.0);
  });
});

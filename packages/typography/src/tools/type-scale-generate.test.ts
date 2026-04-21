import { describe, it, expect } from 'vitest';
import { typeScaleGenerate } from './type-scale-generate.js';

describe('typeScaleGenerate', () => {
  const defaults = { ratio: 1.25, steps: [-2, -1, 0, 1, 2, 3, 4] as number[] };

  it('generates default scale with base 16', () => {
    const result = typeScaleGenerate({ base: 16, ...defaults });
    expect(result.scale.length).toBe(7);
    expect(result.scale[2]).toEqual({ name: 'base', size: 16, lineHeight: 24 });
  });

  it('calculates correct sizes for major third ratio', () => {
    const result = typeScaleGenerate({ base: 16, ratio: 1.25, steps: defaults.steps });
    const base = result.scale.find((s) => s.name === 'base');
    const xl = result.scale.find((s) => s.name === 'xl');
    expect(base!.size).toBe(16);
    expect(xl!.size).toBeCloseTo(25, 1);
  });

  it('returns even line heights', () => {
    const result = typeScaleGenerate({ base: 16, ...defaults });
    for (const entry of result.scale) {
      expect(entry.lineHeight % 2).toBe(0);
    }
  });

  it('handles custom steps', () => {
    const result = typeScaleGenerate({ base: 16, ratio: 1.25, steps: [0, 1, 2] });
    expect(result.scale.length).toBe(3);
    expect(result.scale.map((s) => s.name)).toEqual(['base', 'lg', 'xl']);
  });

  it('handles zero base', () => {
    const result = typeScaleGenerate({ base: 0, ...defaults });
    expect(result.scale.every((s) => s.size === 0)).toBe(true);
  });

  it('handles negative base', () => {
    const result = typeScaleGenerate({ base: -16, ...defaults });
    const baseStep = result.scale.find((s) => s.name === 'base');
    expect(baseStep!.size).toBe(-16);
  });
});

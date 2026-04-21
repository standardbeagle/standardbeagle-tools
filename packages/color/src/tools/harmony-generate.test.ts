import { describe, it, expect } from 'vitest';
import { generateHarmony } from './harmony-generate.js';

describe('generateHarmony', () => {
  it('triadic from red → red, green, blue', () => {
    const result = generateHarmony({ base: '#FF0000', scheme: 'triadic' });
    expect(result.palette.length).toBe(3);
    expect(result.palette[0]).toBe('#ff0000');
    expect(result.palette[1]).toBe('#00ff00');
    expect(result.palette[2]).toBe('#0000ff');
  });

  it('complementary from #0066CC', () => {
    const result = generateHarmony({ base: '#0066CC', scheme: 'complementary' });
    expect(result.palette.length).toBe(2);
    expect(result.palette[0]).toBe('#0066cc');
    expect(result.palette[1]).toBe('#cc6600');
  });

  it('monochromatic count=5 returns 5 entries', () => {
    const result = generateHarmony({ base: '#0066CC', scheme: 'monochromatic', count: 5 });
    expect(result.palette.length).toBe(5);
    // Check increasing lightness
    const lums = result.palette.map((hex) => parseInt(hex.slice(1, 3), 16));
    for (let i = 1; i < lums.length; i++) {
      expect(lums[i]).toBeGreaterThanOrEqual(lums[i - 1]! - 5);
    }
  });

  it('analogous count=3', () => {
    const result = generateHarmony({ base: '#FF0000', scheme: 'analogous', count: 3 });
    expect(result.palette.length).toBe(3);
    expect(result.palette[1]).toBe('#ff0000');
  });

  it('tetradic returns 4 colors', () => {
    const result = generateHarmony({ base: '#FF0000', scheme: 'tetradic' });
    expect(result.palette.length).toBe(4);
  });

  it('split-complementary returns 3 colors', () => {
    const result = generateHarmony({ base: '#FF0000', scheme: 'split-complementary' });
    expect(result.palette.length).toBe(3);
  });
});

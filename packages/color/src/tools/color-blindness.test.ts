import { describe, it, expect } from 'vitest';
import { colorBlindness } from './color-blindness.js';

describe('colorBlindness', () => {
  it('severity=0 returns original', () => {
    const result = colorBlindness({ colors: '#FF0000', type: 'deuteranopia', severity: 0 });
    expect(result.results[0]!.deuteranopia).toBe('#ff0000');
  });

  it('severity=1 changes red under deuteranopia', () => {
    const result = colorBlindness({ colors: '#FF0000', type: 'deuteranopia', severity: 1 });
    expect(result.results[0]!.deuteranopia).not.toBe('#ff0000');
  });

  it('simulates all three types', () => {
    const result = colorBlindness({ colors: '#FF0000', type: 'all', severity: 1 });
    expect(result.results[0]!.deuteranopia).toBeDefined();
    expect(result.results[0]!.protanopia).toBeDefined();
    expect(result.results[0]!.tritanopia).toBeDefined();
  });

  it('handles array input', () => {
    const result = colorBlindness({ colors: ['#FF0000', '#0000FF'], type: 'all', severity: 1 });
    expect(result.results.length).toBe(2);
  });

  it('red under deuteranopia → dark yellowish', () => {
    const result = colorBlindness({ colors: '#FF0000', type: 'deuteranopia', severity: 1 });
    const sim = result.results[0]!.deuteranopia!;
    // Should be significantly different from pure red
    expect(sim).not.toBe('#ff0000');
    // Green channel should increase (yellow shift)
    const g = parseInt(sim.slice(3, 5), 16);
    expect(g).toBeGreaterThan(50);
  });

  it('blue under tritanopia shifts toward teal', () => {
    const result = colorBlindness({ colors: '#0000FF', type: 'tritanopia', severity: 1 });
    const sim = result.results[0]!.tritanopia!;
    expect(sim).not.toBe('#0000ff');
  });
});

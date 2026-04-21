import { describe, it, expect } from 'vitest';
import { tokenCreate } from './token-create.js';

describe('tokenCreate', () => {
  it('creates a simple token without reference', () => {
    const result = tokenCreate({ name: 'primary', value: '#ff0000', type: 'color' });
    expect(result.name).toBe('primary');
    expect(result.value).toBe('#ff0000');
    expect(result.type).toBe('color');
    expect(result.computedValue).toBe('#ff0000');
  });

  it('creates a token with description', () => {
    const result = tokenCreate({ name: 'spacing-md', value: '16px', type: 'spacing', description: 'Medium spacing' });
    expect(result.description).toBe('Medium spacing');
    expect(result.computedValue).toBe('16px');
  });

  it('resolves a reference from context tokens', () => {
    const context = [
      { name: 'base-red', value: '#ff0000', type: 'color' as const },
    ];
    const result = tokenCreate({ name: 'primary', value: '#ff0000', type: 'color', reference: 'base-red', tokens: context });
    expect(result.reference).toBe('base-red');
    expect(result.computedValue).toBe('#ff0000');
  });

  it('resolves a chained reference', () => {
    const context = [
      { name: 'base', value: '#000000', type: 'color' as const },
      { name: 'derived', value: '{base}', type: 'color' as const, reference: 'base' },
    ];
    const result = tokenCreate({ name: 'final', value: '{derived}', type: 'color', reference: 'derived', tokens: context });
    expect(result.computedValue).toBe('#000000');
  });

  it('falls back to value when reference is missing', () => {
    const result = tokenCreate({ name: 'primary', value: '#ff0000', type: 'color', reference: 'missing' });
    expect(result.computedValue).toBe('#ff0000');
  });

  it('handles circular references gracefully', () => {
    const context = [
      { name: 'a', value: '{b}', type: 'color' as const, reference: 'b' },
      { name: 'b', value: '{a}', type: 'color' as const, reference: 'a' },
    ];
    const result = tokenCreate({ name: 'entry', value: '#fallback', type: 'color', reference: 'a', tokens: context });
    expect(result.computedValue).toBe('#fallback');
  });
});

import { describe, it, expect } from 'vitest';
import { tokenValidate } from './token-validate.js';

describe('tokenValidate', () => {
  it('returns no errors for valid tokens', () => {
    const result = tokenValidate({
      tokens: [
        { name: 'primary', value: '#ff0000', type: 'color' },
        { name: 'spacing-md', value: '16px', type: 'spacing' },
      ],
    });
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('detects duplicate names', () => {
    const result = tokenValidate({
      tokens: [
        { name: 'primary', value: '#ff0000', type: 'color' },
        { name: 'primary', value: '#00ff00', type: 'color' },
      ],
    });
    expect(result.errors).toContain('Duplicate token name: "primary"');
  });

  it('detects unresolved references', () => {
    const result = tokenValidate({
      tokens: [{ name: 'derived', value: '{missing}', type: 'color', reference: 'missing' }],
    });
    expect(result.errors).toContain('Token "derived" references unresolved token: "missing"');
  });

  it('detects circular references', () => {
    const result = tokenValidate({
      tokens: [
        { name: 'a', value: '{b}', type: 'color', reference: 'b' },
        { name: 'b', value: '{a}', type: 'color', reference: 'a' },
      ],
    });
    expect(result.errors.some((e) => e.includes('circular reference'))).toBe(true);
  });

  it('detects invalid color values', () => {
    const result = tokenValidate({
      tokens: [{ name: 'bad-color', value: 'not-a-color', type: 'color' }],
    });
    expect(result.errors).toContain('Token "bad-color" has invalid color value: not-a-color');
  });

  it('detects invalid size values', () => {
    const result = tokenValidate({
      tokens: [{ name: 'bad-size', value: 'large', type: 'size' }],
    });
    expect(result.errors).toContain('Token "bad-size" has invalid size value: large');
  });

  it('accepts valid color formats', () => {
    const result = tokenValidate({
      tokens: [
        { name: 'hex', value: '#fff', type: 'color' },
        { name: 'hex6', value: '#ffffff', type: 'color' },
        { name: 'rgb', value: 'rgb(255,0,0)', type: 'color' },
        { name: 'rgba', value: 'rgba(255,0,0,0.5)', type: 'color' },
        { name: 'hsl', value: 'hsl(120,50%,50%)', type: 'color' },
        { name: 'hsla', value: 'hsla(120,50%,50%,0.5)', type: 'color' },
      ],
    });
    expect(result.errors).toHaveLength(0);
  });
});

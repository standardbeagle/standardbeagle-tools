import { describe, it, expect } from 'vitest';
import { tokenImport } from './token-import.js';

describe('tokenImport', () => {
  it('imports CSS custom properties', () => {
    const source = ':root { --primary: #ff0000; --spacing-md: 16px; }';
    const result = tokenImport({ source, format: 'css' });
    expect(result.tokens).toHaveLength(2);
    expect(result.tokens[0]).toEqual({ name: '--primary', value: '#ff0000', type: 'color' });
    expect(result.tokens[1]).toEqual({ name: '--spacing-md', value: '16px', type: 'spacing' });
  });

  it('imports SCSS variables', () => {
    const source = '$primary: #ff0000; $spacing-md: 16px;';
    const result = tokenImport({ source, format: 'scss' });
    expect(result.tokens).toHaveLength(2);
    expect(result.tokens[0]).toEqual({ name: '$primary', value: '#ff0000', type: 'color' });
    expect(result.tokens[1]).toEqual({ name: '$spacing-md', value: '16px', type: 'spacing' });
  });

  it('imports JSON array', () => {
    const source = JSON.stringify([
      { name: 'primary', value: '#ff0000', type: 'color', description: 'Main color' },
    ]);
    const result = tokenImport({ source, format: 'json' });
    expect(result.tokens).toHaveLength(1);
    expect(result.tokens[0]).toEqual({
      name: 'primary',
      value: '#ff0000',
      type: 'color',
      description: 'Main color',
    });
  });

  it('imports nested JSON object', () => {
    const source = JSON.stringify({
      color: {
        primary: { value: '#ff0000', type: 'color' },
        secondary: { value: '#00ff00' },
      },
      spacing: {
        md: { value: '16px' },
      },
    });
    const result = tokenImport({ source, format: 'json' });
    expect(result.tokens).toHaveLength(3);
    const primary = result.tokens.find((t) => t.name === 'color.primary');
    expect(primary).toBeDefined();
    expect(primary!.value).toBe('#ff0000');
    expect(primary!.type).toBe('color');
  });

  it('infers types from value patterns and names', () => {
    const source = JSON.stringify([
      { name: 'hex', value: '#abc' },
      { name: 'rgb', value: 'rgb(0,0,0)' },
      { name: 'rgba', value: 'rgba(0,0,0,0.5)' },
      { name: 'hsl', value: 'hsl(0,0%,0%)' },
      { name: 'px', value: '12px' },
      { name: 'rem', value: '1rem' },
    ]);
    const result = tokenImport({ source, format: 'json' });
    expect(result.tokens.find((t) => t.name === 'hex')!.type).toBe('color');
    expect(result.tokens.find((t) => t.name === 'rgb')!.type).toBe('color');
    expect(result.tokens.find((t) => t.name === 'rgba')!.type).toBe('color');
    expect(result.tokens.find((t) => t.name === 'hsl')!.type).toBe('color');
    expect(result.tokens.find((t) => t.name === 'px')!.type).toBe('size');
    expect(result.tokens.find((t) => t.name === 'rem')!.type).toBe('size');
  });

  it('throws on invalid JSON format', () => {
    expect(() => tokenImport({ source: 'not valid json', format: 'json' })).toThrow();
  });
});

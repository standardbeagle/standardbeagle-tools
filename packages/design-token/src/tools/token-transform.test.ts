import { describe, it, expect } from 'vitest';
import { tokenTransform } from './token-transform.js';

const sampleTokens = [
  { name: 'primary', value: '#ff0000', type: 'color' as const },
  { name: 'spacing-md', value: '16px', type: 'spacing' as const },
];

describe('tokenTransform', () => {
  it('transforms to css-vars', () => {
    const result = tokenTransform({ tokens: sampleTokens, format: 'css-vars' });
    expect(result.result).toContain(':root');
    expect(result.result).toContain('--primary: #ff0000;');
    expect(result.result).toContain('--spacing-md: 16px;');
  });

  it('transforms to scss', () => {
    const result = tokenTransform({ tokens: sampleTokens, format: 'scss' });
    expect(result.result).toContain('$primary: #ff0000;');
    expect(result.result).toContain('$spacing-md: 16px;');
  });

  it('transforms to json', () => {
    const result = tokenTransform({ tokens: sampleTokens, format: 'json' });
    const parsed = JSON.parse(result.result);
    expect(parsed.primary.value).toBe('#ff0000');
    expect(parsed['spacing-md'].value).toBe('16px');
  });

  it('transforms to android-xml', () => {
    const result = tokenTransform({ tokens: sampleTokens, format: 'android-xml' });
    expect(result.result).toContain('<?xml version="1.0" encoding="utf-8"?>');
    expect(result.result).toContain('<color name="primary">#ff0000</color>');
    expect(result.result).toContain('<dimen name="spacing_md">16px</dimen>');
  });

  it('transforms to ios-swift', () => {
    const result = tokenTransform({ tokens: sampleTokens, format: 'ios-swift' });
    expect(result.result).toContain('let primary = UIColor(named: "#ff0000") ?? UIColor()');
    expect(result.result).toContain('let spacingMd: CGFloat = 16');
  });

  it('throws on unknown format', () => {
    expect(() =>
      tokenTransform({ tokens: sampleTokens, format: 'unknown' as 'css-vars' }),
    ).toThrow('Unknown format');
  });
});

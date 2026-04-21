import { describe, it, expect } from 'vitest';
import { tokenExport } from './token-export.js';

const sampleTokens = [
  { name: 'primary', value: '#ff0000', type: 'color' as const },
  { name: 'spacing-md', value: '16px', type: 'spacing' as const },
  { name: 'radius-sm', value: '4px', type: 'radius' as const },
];

describe('tokenExport', () => {
  it('exports all tokens to css-vars by default', () => {
    const result = tokenExport({ tokens: sampleTokens, format: 'css-vars' });
    expect(result.result).toContain('--primary: #ff0000;');
    expect(result.result).toContain('--spacing-md: 16px;');
    expect(result.result).toContain('--radius-sm: 4px;');
  });

  it('applies prefix', () => {
    const result = tokenExport({ tokens: sampleTokens, format: 'scss', prefix: 'app' });
    expect(result.result).toContain('$app-primary: #ff0000;');
  });

  it('filters by includeCategories', () => {
    const result = tokenExport({ tokens: sampleTokens, format: 'css-vars', includeCategories: ['color'] });
    expect(result.result).toContain('--primary: #ff0000;');
    expect(result.result).not.toContain('spacing-md');
  });

  it('filters by excludeCategories', () => {
    const result = tokenExport({ tokens: sampleTokens, format: 'css-vars', excludeCategories: ['color'] });
    expect(result.result).not.toContain('--primary');
    expect(result.result).toContain('--spacing-md: 16px;');
  });

  it('exports to json', () => {
    const result = tokenExport({ tokens: sampleTokens, format: 'json' });
    const parsed = JSON.parse(result.result);
    expect(Object.keys(parsed)).toHaveLength(3);
  });

  it('exports to android-xml', () => {
    const result = tokenExport({ tokens: sampleTokens, format: 'android-xml' });
    expect(result.result).toContain('<color name="primary">#ff0000</color>');
    expect(result.result).toContain('<dimen name="spacing_md">16px</dimen>');
  });

  it('exports to ios-swift', () => {
    const result = tokenExport({ tokens: sampleTokens, format: 'ios-swift' });
    expect(result.result).toContain('let primary = UIColor(named: "#ff0000") ?? UIColor()');
  });
});

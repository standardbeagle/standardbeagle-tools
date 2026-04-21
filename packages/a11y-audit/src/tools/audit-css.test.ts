import { describe, it, expect } from 'vitest';
import { auditCss } from './audit-css.js';

describe('auditCss', () => {
  it('runs without error on valid HTML', async () => {
    const html = '<!DOCTYPE html><html lang="en"><head><title>T</title></head><body><p>Hello</p></body></html>';
    const result = await auditCss({ html });
    expect(result).toHaveProperty('violations');
    expect(result).toHaveProperty('passes');
    expect(Array.isArray(result.violations)).toBe(true);
  });

  it('allows tag override to find violations', async () => {
    const html = '<!DOCTYPE html><html><head><title>T</title></head><body><img src="x.jpg"></body></html>';
    const result = await auditCss({ html, tags: ['wcag2a'] });
    expect(result.violations.length).toBeGreaterThan(0);
  });
});

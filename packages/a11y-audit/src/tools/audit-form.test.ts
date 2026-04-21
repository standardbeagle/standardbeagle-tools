import { describe, it, expect } from 'vitest';
import { auditForm } from './audit-form.js';

describe('auditForm', () => {
  it('runs without error on valid HTML', async () => {
    const html = '<!DOCTYPE html><html lang="en"><head><title>T</title></head><body><p>Hello</p></body></html>';
    const result = await auditForm({ html });
    expect(result).toHaveProperty('violations');
    expect(Array.isArray(result.violations)).toBe(true);
  });

  it('allows tag override to find violations', async () => {
    const html = '<!DOCTYPE html><html><head><title>T</title></head><body><img src="x.jpg"></body></html>';
    const result = await auditForm({ html, tags: ['wcag2a'] });
    expect(result.violations.length).toBeGreaterThan(0);
  });
});

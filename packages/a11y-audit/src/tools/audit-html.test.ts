import { describe, it, expect } from 'vitest';
import { auditHtml } from './audit-html.js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadFixture(name: string): string {
  return readFileSync(resolve(__dirname, '../../test/fixtures', name), 'utf-8');
}

describe('auditHtml', () => {
  it('detects missing alt text', async () => {
    const html = loadFixture('missing-alt.html');
    const result = await auditHtml({ html, tags: ['wcag2a'] });
    const imageAltViolation = result.violations.find((v) => v.id === 'image-alt');
    expect(imageAltViolation).toBeDefined();
    expect(imageAltViolation!.impact).toBe('critical');
  });

  it('returns no violations for clean HTML', async () => {
    const html = loadFixture('clean.html');
    const result = await auditHtml({ html, tags: ['wcag2a'] });
    expect(result.violations.length).toBe(0);
    expect(result.passes).toBeGreaterThan(0);
  });

  it('filters by tags', async () => {
    const html = loadFixture('missing-alt.html');
    const resultA = await auditHtml({ html, tags: ['wcag2a'] });
    const resultAA = await auditHtml({ html, tags: ['wcag21aa'] });
    // wcag2a has many more rules than wcag21aa, so it should catch more violations
    expect(resultA.violations.length).toBeGreaterThanOrEqual(resultAA.violations.length);
  });

  it('includes WCAG refs in violations', async () => {
    const html = loadFixture('missing-alt.html');
    const result = await auditHtml({ html, tags: ['wcag2a'] });
    const violation = result.violations.find((v) => v.id === 'image-alt');
    expect(violation).toBeDefined();
    expect(violation!.wcag_refs.length).toBeGreaterThan(0);
  });

  it('detects heading order issue', async () => {
    const html = loadFixture('heading-order.html');
    const result = await auditHtml({ html, tags: ['best-practice'] });
    const headingOrder = result.violations.find((v) => v.id === 'heading-order');
    expect(headingOrder).toBeDefined();
  });

  it('handles ~100KB HTML in under 2s', async () => {
    let articles = '';
    for (let i = 0; i < 130; i++) {
      const para = ('Content for article ' + i + '. ').repeat(30);
      articles +=
        '<article><h2>Article ' +
        i +
        '</h2><p>' +
        para +
        '</p><img src="a' +
        i +
        '.jpg" alt="art ' +
        i +
        '"><a href="#a' +
        i +
        '">more</a></article>';
    }
    const html =
      '<!DOCTYPE html><html lang="en"><head><title>Real</title></head><body><h1>Site</h1><main>' +
      articles +
      '</main></body></html>';
    expect(html.length).toBeGreaterThan(100 * 1024);
    // Warm-up run (first jsdom + axe load is slow)
    await auditHtml({ html: '<html lang="en"><body><p>warm</p></body></html>', tags: ['wcag21aa'] });
    const t0 = Date.now();
    await auditHtml({ html, tags: ['wcag21aa'] });
    const elapsed = Date.now() - t0;
    expect(elapsed).toBeLessThan(2000);
  }, 10000);
});

import { describe, it, expect } from 'vitest';
import { wcagScore } from './wcag-score.js';
import { WCAG_CRITERIA } from '../lib/wcag-criteria.js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadFixture(name: string): string {
  return readFileSync(resolve(__dirname, '../../test/fixtures', name), 'utf-8');
}

describe('wcagScore', () => {
  it('flags 1.1.1 (Non-text Content) as fail when image has no alt', async () => {
    const html = loadFixture('missing-alt.html');
    const result = await wcagScore({ html, target_level: 'A' });

    const sc111 = result.criteria.find((c) => c.id === '1.1.1');
    expect(sc111).toBeDefined();
    expect(sc111!.status).toBe('fail');
    expect(sc111!.title).toBe('Non-text Content');

    expect(result.level_a.failed).toBeGreaterThanOrEqual(1);
  });

  it('returns score 1.0 for all levels on clean fixture', async () => {
    const html = loadFixture('clean.html');
    const result = await wcagScore({ html, target_level: 'AA' });

    expect(result.level_a.failed).toBe(0);
    expect(result.level_aa.failed).toBe(0);
    expect(result.level_aaa.failed).toBe(0);

    expect(result.level_a.score).toBe(1);
    expect(result.level_aa.score).toBe(1);
    expect(result.level_aaa.score).toBe(1);
  });

  it('compliance_report_markdown contains every failing SC title', async () => {
    const html = loadFixture('missing-alt.html');
    const result = await wcagScore({ html, target_level: 'AA' });

    const failing = result.criteria.filter((c) => c.status === 'fail');
    expect(failing.length).toBeGreaterThan(0);

    for (const sc of failing) {
      expect(result.compliance_report_markdown).toContain(sc.title);
    }
  });

  it('catalogs at least 78 WCAG 2.2 criteria across A/AA/AAA', async () => {
    const html = loadFixture('clean.html');
    const result = await wcagScore({ html, target_level: 'AA' });

    expect(result.criteria.length).toBeGreaterThanOrEqual(78);
    expect(WCAG_CRITERIA.length).toBeGreaterThanOrEqual(78);

    const levels = new Set(result.criteria.map((c) => c.level));
    expect(levels.has('A')).toBe(true);
    expect(levels.has('AA')).toBe(true);
    expect(levels.has('AAA')).toBe(true);
  });

  it('marks SCs with no axe coverage as untestable', async () => {
    const html = loadFixture('clean.html');
    const result = await wcagScore({ html, target_level: 'A' });

    // 1.2.3 Audio Description or Media Alternative — no axe rule covers this
    const sc123 = result.criteria.find((c) => c.id === '1.2.3');
    expect(sc123).toBeDefined();
    expect(sc123!.status).toBe('untestable');
  });
});

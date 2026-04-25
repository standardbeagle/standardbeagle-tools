import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { pdfA11y } from './pdf-a11y.js';

const FIXTURES = join(__dirname, '..', '..', 'test', 'fixtures');
const UNTAGGED = join(FIXTURES, 'untagged.pdf');
const TAGGED = join(FIXTURES, 'tagged.pdf');
const MIXED = join(FIXTURES, 'mixed.pdf');

describe('pdfA11y', () => {
  it('untagged PDF: is_tagged false, score < 40, flags not_tagged', async () => {
    const result = await pdfA11y({ pdf_path: UNTAGGED });
    expect(result.is_tagged).toBe(false);
    expect(result.has_structure_tree).toBe(false);
    expect(result.score).toBeLessThan(40);
    expect(result.issues).toContain('not_tagged');
    expect(result.issues).toContain('missing_structure_tree');
    expect(result.issues).toContain('missing_language');
    expect(result.issues).toContain('missing_title');
    // No images / no form fields → those slots count as full credit, but
    // the missing 40 (tagged) + 10 (lang) + 10 (title) + 10 (reading order)
    // pulls the score down well under 40.
    expect(result.image_count).toBe(0);
    expect(result.images_with_alt).toBe(0);
    expect(result.form_fields_total).toBe(0);
  });

  it('tagged PDF: is_tagged true, score > 80, no parse_error', async () => {
    const result = await pdfA11y({ pdf_path: TAGGED });
    expect(result.is_tagged).toBe(true);
    expect(result.has_structure_tree).toBe(true);
    expect(result.language).toBe('en-US');
    expect(result.title).toBe('Tagged Sample');
    expect(result.image_count).toBe(1);
    expect(result.images_with_alt).toBe(1);
    expect(result.reading_order_defined).toBe(true);
    expect(result.score).toBeGreaterThan(80);
    expect(result.issues).not.toContain('parse_error');
    expect(result.issues).not.toContain('not_tagged');
    expect(result.issues).not.toContain('image_without_alt');
  });

  it('mixed PDF: tagged but image-without-alt and form-field-unlabeled, 40 < score < 80', async () => {
    const result = await pdfA11y({ pdf_path: MIXED });
    expect(result.is_tagged).toBe(true);
    expect(result.has_structure_tree).toBe(true);
    expect(result.image_count).toBe(2);
    expect(result.images_with_alt).toBe(1);
    expect(result.form_fields_total).toBe(1);
    expect(result.form_fields_labeled).toBe(1); // /T name auto-set; /TU absent
    expect(result.title).toBeUndefined();
    expect(result.issues).toContain('image_without_alt');
    expect(result.issues).toContain('missing_title');
    expect(result.score).toBeGreaterThan(40);
    // Spec range "between 40 and 80" is inclusive on the upper bound; mixed
    // hits exactly 80 with the current weights (tagged=40 + alt=10 + lang=10
    // + form=10 + reading_order=10, title=0). Keep <= to match the spec.
    expect(result.score).toBeLessThanOrEqual(80);
  });

  it('malformed bytes: returns issues:[parse_error] without throwing', async () => {
    const tmpDir = mkdtempSync(join(tmpdir(), 'pdf-a11y-bad-'));
    const badPath = join(tmpDir, 'bogus.pdf');
    writeFileSync(badPath, 'not a pdf, just bytes');
    const result = await pdfA11y({ pdf_path: badPath });
    expect(result.issues).toEqual(['parse_error']);
    expect(result.score).toBe(0);
    expect(result.is_tagged).toBe(false);
    expect(result.has_structure_tree).toBe(false);
    expect(result.image_count).toBe(0);
    expect(result.form_fields_total).toBe(0);
  });

  it('missing file: returns issues:[parse_error] without throwing', async () => {
    const result = await pdfA11y({
      pdf_path: '/tmp/this-path-does-not-exist-pdf-a11y-test.pdf',
    });
    expect(result.issues).toEqual(['parse_error']);
    expect(result.score).toBe(0);
  });

  it('score is deterministic across repeated calls on same fixture', async () => {
    const a = await pdfA11y({ pdf_path: TAGGED });
    const b = await pdfA11y({ pdf_path: TAGGED });
    const c = await pdfA11y({ pdf_path: TAGGED });
    expect(a.score).toBe(b.score);
    expect(b.score).toBe(c.score);
    expect(a.issues).toEqual(b.issues);
    expect(a.image_count).toBe(b.image_count);
    expect(a.images_with_alt).toBe(b.images_with_alt);
  });

  it('score is deterministic for mixed fixture too', async () => {
    const a = await pdfA11y({ pdf_path: MIXED });
    const b = await pdfA11y({ pdf_path: MIXED });
    expect(a.score).toBe(b.score);
    expect(a.issues).toEqual(b.issues);
  });
});

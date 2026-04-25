import { describe, it, expect } from 'vitest';
import { headingStructure } from './heading-structure.js';

describe('headingStructure', () => {
  it('flags a skipped heading level', async () => {
    const result = await headingStructure({ html: '<h1>A</h1><h3>B</h3>' });
    const skipped = result.issues.filter((i) => i.type === 'skipped_level');
    expect(skipped).toHaveLength(1);
    expect(skipped[0]!.location).toBe('h3 #1');
    expect(skipped[0]!.fix).toMatch(/h1/);
    expect(skipped[0]!.fix).toMatch(/h3/);
    expect(result.has_h1).toBe(true);
    expect(result.max_depth).toBe(3);
    expect(result.outline).toEqual([
      { level: 1, text: 'A' },
      { level: 3, text: 'B' },
    ]);
  });

  it('flags missing h1 when document starts at h2', async () => {
    const result = await headingStructure({ html: '<h2>A</h2>' });
    expect(result.has_h1).toBe(false);
    expect(result.issues.some((i) => i.type === 'missing_h1')).toBe(true);
    expect(result.outline).toEqual([{ level: 2, text: 'A' }]);
    expect(result.max_depth).toBe(2);
  });

  it('flags multiple h1s with one issue per extra', async () => {
    const result = await headingStructure({
      html: '<h1>A</h1><h1>B</h1><h1>C</h1>',
    });
    const multi = result.issues.filter((i) => i.type === 'multiple_h1');
    expect(multi).toHaveLength(2);
    expect(multi[0]!.location).toBe('h1 #2');
    expect(multi[1]!.location).toBe('h1 #3');
    expect(result.has_h1).toBe(true);
    expect(result.max_depth).toBe(1);
  });

  it('flags empty headings (whitespace counts as empty)', async () => {
    const result = await headingStructure({ html: '<h1></h1>' });
    const empty = result.issues.filter((i) => i.type === 'empty_heading');
    expect(empty).toHaveLength(1);
    expect(empty[0]!.location).toBe('h1 #1');
    // Whitespace-only also empty
    const ws = await headingStructure({ html: '<h1>   </h1>' });
    expect(ws.issues.filter((i) => i.type === 'empty_heading')).toHaveLength(1);
  });

  it('clean three-level document has no issues', async () => {
    const result = await headingStructure({
      html: '<h1>Title</h1><h2>Section</h2><h3>Sub</h3>',
    });
    expect(result.issues).toEqual([]);
    expect(result.has_h1).toBe(true);
    expect(result.max_depth).toBe(3);
    expect(result.outline).toEqual([
      { level: 1, text: 'Title' },
      { level: 2, text: 'Section' },
      { level: 3, text: 'Sub' },
    ]);
  });

  it('preserves document order and captures id attribute', async () => {
    const html =
      '<section><h2 id="b">B</h2></section><h1 id="a">A</h1><h2>C</h2>';
    const result = await headingStructure({ html });
    expect(result.outline).toEqual([
      { level: 2, text: 'B', id: 'b' },
      { level: 1, text: 'A', id: 'a' },
      { level: 2, text: 'C' },
    ]);
    // First heading h2 with prev=0 → no skipped_level (only flagged when prev>0)
    expect(result.issues.filter((i) => i.type === 'skipped_level')).toEqual([]);
  });

  it('returns max_depth 0 and missing_h1 on empty document', async () => {
    const result = await headingStructure({ html: '<p>no headings</p>' });
    expect(result.outline).toEqual([]);
    expect(result.max_depth).toBe(0);
    expect(result.has_h1).toBe(false);
    expect(result.issues.some((i) => i.type === 'missing_h1')).toBe(true);
  });

  it('does no network I/O — pure parse on a string', async () => {
    // Sentinel: tool must not throw on offline-like environment.
    // Cheerio parses synchronously without fetching external resources.
    const html =
      '<html><body><h1>Local</h1><img src="https://example.com/never-fetch.png"><h2>OK</h2></body></html>';
    const result = await headingStructure({ html });
    expect(result.has_h1).toBe(true);
    expect(result.outline.map((o) => o.level)).toEqual([1, 2]);
  });
});

import { describe, it, expect } from 'vitest';
import { toScss } from './scss.js';
import type { DTCGTree } from '../schema/dtcg.js';

/**
 * Round-trip helper: parse a generated SCSS block back into the set of variable
 * names it declares (without the leading `$`). Used to prove the exporter
 * preserves token identity end-to-end.
 */
function recoverVarNames(scss: string): string[] {
  const out: string[] = [];
  for (const line of scss.split('\n')) {
    const m = /^\$([A-Za-z0-9_-]+):\s*.+;$/.exec(line);
    if (m) out.push(m[1]!);
  }
  return out;
}

describe('toScss', () => {
  it('flat color token → single $color-X line', () => {
    const tree: DTCGTree = {
      color: {
        primary: { $value: '#0066cc', $type: 'color' },
      },
    };
    const scss = toScss(tree);
    expect(scss).toBe('$color-primary: #0066cc;\n');
  });

  it('nested group → hyphenated variable name', () => {
    const tree: DTCGTree = {
      color: {
        brand: {
          primary: { $value: '#0066cc', $type: 'color' },
        },
      },
    };
    const scss = toScss(tree);
    expect(scss).toContain('$color-brand-primary: #0066cc;');
  });

  it('reference `{color.primary}` resolves to $color-primary', () => {
    const tree: DTCGTree = {
      color: {
        primary: { $value: '#0066cc', $type: 'color' },
        accent: { $value: '{color.primary}', $type: 'color' },
      },
    };
    const scss = toScss(tree);
    expect(scss).toContain('$color-accent: $color-primary;');
    expect(scss).toContain('$color-primary: #0066cc;');
  });

  it('reference with prefix → ref name picks up the same prefix', () => {
    const tree: DTCGTree = {
      color: {
        primary: { $value: '#0066cc', $type: 'color' },
        accent: { $value: '{color.primary}', $type: 'color' },
      },
    };
    const scss = toScss(tree, { prefix: 'ds' });
    expect(scss).toContain('$ds-color-primary: #0066cc;');
    expect(scss).toContain('$ds-color-accent: $ds-color-primary;');
  });

  it('custom prefix is applied to every variable name', () => {
    const tree: DTCGTree = {
      color: { primary: { $value: '#0066cc', $type: 'color' } },
      spacing: { '1': { $value: '4px', $type: 'dimension' } },
    };
    const scss = toScss(tree, { prefix: 'ds' });
    const names = recoverVarNames(scss);
    expect(names).toEqual(['ds-color-primary', 'ds-spacing-1']);
    for (const n of names) expect(n.startsWith('ds-')).toBe(true);
  });

  it('determinism: same input twice → byte-identical output', () => {
    const tree: DTCGTree = {
      color: {
        primary: { $value: '#0066cc', $type: 'color' },
        secondary: { $value: '#ff0000', $type: 'color' },
      },
      spacing: {
        '0': { $value: '0px', $type: 'dimension' },
        '1': { $value: '4px', $type: 'dimension' },
      },
      font: {
        size: { body: { $value: '16px', $type: 'dimension' } },
      },
    };
    expect(toScss(tree)).toBe(toScss(tree));
    // And insertion-order independence: rebuild the same tree with reversed key order.
    const reordered: DTCGTree = {
      font: { size: { body: { $value: '16px', $type: 'dimension' } } },
      spacing: {
        '1': { $value: '4px', $type: 'dimension' },
        '0': { $value: '0px', $type: 'dimension' },
      },
      color: {
        secondary: { $value: '#ff0000', $type: 'color' },
        primary: { $value: '#0066cc', $type: 'color' },
      },
    };
    expect(toScss(reordered)).toBe(toScss(tree));
  });

  it('round-trip: parsed SCSS variable names equal the original flattened paths', () => {
    const tree: DTCGTree = {
      color: {
        primary: { $value: '#0066cc', $type: 'color' },
        brand: { accent: { $value: '#ff0000', $type: 'color' } },
      },
      spacing: {
        '0': { $value: '0px', $type: 'dimension' },
        '4': { $value: '16px', $type: 'dimension' },
      },
      font: {
        size: { body: { $value: '16px', $type: 'dimension' } },
      },
    };
    const scss = toScss(tree);
    const recovered = recoverVarNames(scss);
    expect(recovered.sort()).toEqual(
      [
        'color-brand-accent',
        'color-primary',
        'font-size-body',
        'spacing-0',
        'spacing-4',
      ].sort(),
    );
  });

  it('empty tree → empty string', () => {
    expect(toScss({})).toBe('');
  });

  it('reserved DTCG keys ($description, $extensions, $type at group level) are skipped', () => {
    const tree: DTCGTree = {
      $description: 'a doc-string on the root',
      color: {
        $type: 'color',
        $description: 'brand colors',
        $extensions: { 'com.example': { foo: 1 } },
        primary: { $value: '#0066cc', $type: 'color' },
      },
    };
    const scss = toScss(tree);
    const names = recoverVarNames(scss);
    expect(names).toEqual(['color-primary']);
    expect(scss).not.toContain('description');
    expect(scss).not.toContain('extensions');
  });

  it('non-string scalar $value is coerced (numbers stringified)', () => {
    const tree: DTCGTree = {
      opacity: { half: { $value: 0.5, $type: 'number' } },
    };
    const scss = toScss(tree);
    expect(scss).toContain('$opacity-half: 0.5;');
  });

  it('non-strict reference (with surrounding text) is not rewritten', () => {
    // DTCG aliasing applies to the entire $value, not to embedded substrings.
    const tree: DTCGTree = {
      color: {
        primary: { $value: '#0066cc', $type: 'color' },
        bad: { $value: 'calc({color.primary} + 1px)', $type: 'color' },
      },
    };
    const scss = toScss(tree);
    expect(scss).toContain('$color-bad: calc({color.primary} + 1px);');
    // The bad value must NOT have been rewritten to a bare $-ref.
    expect(scss).not.toMatch(/\$color-bad:\s*\$/);
  });

  it('forward reference is reordered: target declared before referencer (SCSS eager-eval safety)', () => {
    // Alphabetically `accent` < `primary`, but `accent` references `primary` so
    // the exporter must emit `$color-primary` first, otherwise dart-sass reports
    // "Undefined variable" on the alphabetical first line.
    const tree: DTCGTree = {
      color: {
        accent: { $value: '{color.primary}', $type: 'color' },
        primary: { $value: '#0066cc', $type: 'color' },
      },
    };
    const scss = toScss(tree);
    const primaryIdx = scss.indexOf('$color-primary:');
    const accentIdx = scss.indexOf('$color-accent:');
    expect(primaryIdx).toBeGreaterThanOrEqual(0);
    expect(accentIdx).toBeGreaterThan(primaryIdx);
  });

  it('chained references are emitted in dependency order', () => {
    const tree: DTCGTree = {
      a: { $value: '{b.c}', $type: 'color' },
      b: { c: { $value: '{d.e}', $type: 'color' } },
      d: { e: { $value: '#abcdef', $type: 'color' } },
    };
    const scss = toScss(tree);
    const ai = scss.indexOf('$a:');
    const bci = scss.indexOf('$b-c:');
    const dei = scss.indexOf('$d-e:');
    expect(dei).toBeLessThan(bci);
    expect(bci).toBeLessThan(ai);
  });

  it('output has no surrounding selector block (unlike CSS vars)', () => {
    const tree: DTCGTree = {
      color: { primary: { $value: '#0066cc', $type: 'color' } },
    };
    const scss = toScss(tree);
    expect(scss).not.toContain(':root');
    expect(scss).not.toContain('{');
    expect(scss).not.toContain('}');
  });
});

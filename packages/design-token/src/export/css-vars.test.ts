import { describe, it, expect } from 'vitest';
import { toCssVars } from './css-vars.js';
import type { DTCGTree } from '../schema/dtcg.js';

/**
 * Round-trip helper: parse a generated CSS block back into the set of variable
 * names it declares (without the leading `--`). Used to prove the exporter
 * preserves token identity end-to-end.
 */
function recoverVarNames(css: string): string[] {
  const out: string[] = [];
  for (const line of css.split('\n')) {
    const m = /^\s*--([A-Za-z0-9_-]+):\s*.+;$/.exec(line);
    if (m) out.push(m[1]!);
  }
  return out;
}

describe('toCssVars', () => {
  it('flat color token → single --color-X line', () => {
    const tree: DTCGTree = {
      color: {
        primary: { $value: '#0066cc', $type: 'color' },
      },
    };
    const css = toCssVars(tree);
    expect(css).toBe(':root {\n  --color-primary: #0066cc;\n}\n');
  });

  it('nested group → hyphenated variable name', () => {
    const tree: DTCGTree = {
      color: {
        brand: {
          primary: { $value: '#0066cc', $type: 'color' },
        },
      },
    };
    const css = toCssVars(tree);
    expect(css).toContain('--color-brand-primary: #0066cc;');
  });

  it('reference `{color.primary}` resolves to var(--color-primary)', () => {
    const tree: DTCGTree = {
      color: {
        primary: { $value: '#0066cc', $type: 'color' },
        accent: { $value: '{color.primary}', $type: 'color' },
      },
    };
    const css = toCssVars(tree);
    expect(css).toContain('--color-accent: var(--color-primary);');
    expect(css).toContain('--color-primary: #0066cc;');
  });

  it('reference with prefix → var() name picks up the same prefix', () => {
    const tree: DTCGTree = {
      color: {
        primary: { $value: '#0066cc', $type: 'color' },
        accent: { $value: '{color.primary}', $type: 'color' },
      },
    };
    const css = toCssVars(tree, { prefix: 'ds' });
    expect(css).toContain('--ds-color-primary: #0066cc;');
    expect(css).toContain('--ds-color-accent: var(--ds-color-primary);');
  });

  it('custom prefix is applied to every variable name', () => {
    const tree: DTCGTree = {
      color: { primary: { $value: '#0066cc', $type: 'color' } },
      spacing: { '1': { $value: '4px', $type: 'dimension' } },
    };
    const css = toCssVars(tree, { prefix: 'ds' });
    const names = recoverVarNames(css);
    expect(names).toEqual(['ds-color-primary', 'ds-spacing-1']);
    for (const n of names) expect(n.startsWith('ds-')).toBe(true);
  });

  it('custom selector is used verbatim', () => {
    const tree: DTCGTree = {
      color: { primary: { $value: '#0066cc', $type: 'color' } },
    };
    const css = toCssVars(tree, { selector: "[data-theme='dark']" });
    expect(css.startsWith("[data-theme='dark'] {")).toBe(true);
    expect(css).not.toContain(':root');
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
    expect(toCssVars(tree)).toBe(toCssVars(tree));
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
    expect(toCssVars(reordered)).toBe(toCssVars(tree));
  });

  it('round-trip: parsed CSS variable names equal the original flattened paths', () => {
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
    const css = toCssVars(tree);
    const recovered = recoverVarNames(css);
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

  it('empty tree → just `:root {}`', () => {
    expect(toCssVars({})).toBe(':root {}\n');
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
    const css = toCssVars(tree);
    const names = recoverVarNames(css);
    expect(names).toEqual(['color-primary']);
    expect(css).not.toContain('description');
    expect(css).not.toContain('extensions');
  });

  it('non-string scalar $value is coerced (numbers stringified)', () => {
    const tree: DTCGTree = {
      opacity: { half: { $value: 0.5, $type: 'number' } },
    };
    const css = toCssVars(tree);
    expect(css).toContain('--opacity-half: 0.5;');
  });

  it('non-strict reference (with surrounding text) is not rewritten', () => {
    // DTCG aliasing applies to the entire $value, not to embedded substrings.
    const tree: DTCGTree = {
      color: {
        primary: { $value: '#0066cc', $type: 'color' },
        bad: { $value: 'calc({color.primary} + 1px)', $type: 'color' },
      },
    };
    const css = toCssVars(tree);
    expect(css).toContain('--color-bad: calc({color.primary} + 1px);');
    expect(css).not.toContain('--color-bad: var(');
  });
});

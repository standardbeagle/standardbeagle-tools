import { describe, it, expect } from 'vitest';
import { toTailwindTheme } from './tailwind.js';
import type { DTCGTree } from '../schema/dtcg.js';

describe('toTailwindTheme', () => {
  it('flat color tokens → colors object with named keys', () => {
    const tree: DTCGTree = {
      color: {
        primary: { $value: '#0066cc', $type: 'color' },
        secondary: { $value: '#ff0000', $type: 'color' },
      },
    };
    const out = toTailwindTheme(tree);
    expect(out.colors).toEqual({ primary: '#0066cc', secondary: '#ff0000' });
  });

  it('nested color group preserves hierarchy (gray.100, gray.500)', () => {
    const tree: DTCGTree = {
      color: {
        gray: {
          '100': { $value: '#f5f5f5', $type: 'color' },
          '500': { $value: '#808080' },
          '900': { $value: '#1a1a1a' },
        },
      },
    };
    // Lenient inheritance: leaves without $type adopt parent group's $type.
    // Here only gray.100 carries an explicit $type; the others inherit none
    // and are accepted (lenient mode in buildSlot).
    const out = toTailwindTheme(tree);
    expect(out.colors).toEqual({
      gray: { '100': '#f5f5f5', '500': '#808080', '900': '#1a1a1a' },
    });
  });

  it('font.size.* → fontSize map', () => {
    const tree: DTCGTree = {
      font: {
        size: {
          body: { $value: '16px', $type: 'dimension' },
          h1: { $value: '39px', $type: 'dimension' },
        },
      },
    };
    const out = toTailwindTheme(tree);
    expect(out.fontSize).toEqual({ body: '16px', h1: '39px' });
    expect(out.fontFamily).toBeUndefined();
  });

  it('font.family.* preserves array $value (Tailwind-compatible fallback list)', () => {
    const tree: DTCGTree = {
      font: {
        family: {
          sans: { $value: ['Inter', 'system-ui', 'sans-serif'], $type: 'fontFamily' },
          mono: { $value: 'JetBrains Mono', $type: 'fontFamily' },
        },
      },
    };
    const out = toTailwindTheme(tree);
    expect(out.fontFamily).toEqual({
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: 'JetBrains Mono',
    });
  });

  it('font.weight.* → fontWeight map (numeric and keyword)', () => {
    const tree: DTCGTree = {
      font: {
        weight: {
          regular: { $value: 400, $type: 'fontWeight' },
          bold: { $value: 'bold', $type: 'fontWeight' },
        },
      },
    };
    const out = toTailwindTheme(tree);
    expect(out.fontWeight).toEqual({ regular: 400, bold: 'bold' });
  });

  it('spacing.* → spacing map with numeric-string keys preserved', () => {
    const tree: DTCGTree = {
      spacing: {
        '1': { $value: '4px', $type: 'dimension' },
        '2': { $value: '8px', $type: 'dimension' },
        '4': { $value: '16px', $type: 'dimension' },
      },
    };
    const out = toTailwindTheme(tree);
    expect(out.spacing).toEqual({ '1': '4px', '2': '8px', '4': '16px' });
  });

  it('shadow.* composite $value → boxShadow CSS string', () => {
    const tree: DTCGTree = {
      shadow: {
        sm: {
          $value: {
            color: 'rgba(0,0,0,0.1)',
            offsetX: '0px',
            offsetY: '1px',
            blur: '2px',
            spread: '0px',
          },
          $type: 'shadow',
        },
        inner: {
          $value: {
            color: 'rgba(0,0,0,0.05)',
            offsetX: '0px',
            offsetY: '2px',
            blur: '4px',
            spread: '0px',
            inset: true,
          },
          $type: 'shadow',
        },
      },
    };
    const out = toTailwindTheme(tree);
    expect(out.boxShadow).toEqual({
      sm: '0px 1px 2px 0px rgba(0,0,0,0.1)',
      inner: 'inset 0px 2px 4px 0px rgba(0,0,0,0.05)',
    });
  });

  it('shadow.* legacy string $value passes through unchanged', () => {
    const tree: DTCGTree = {
      shadow: {
        legacy: { $value: '0 4px 6px rgba(0,0,0,0.1)', $type: 'shadow' },
      },
    };
    const out = toTailwindTheme(tree);
    expect(out.boxShadow).toEqual({ legacy: '0 4px 6px rgba(0,0,0,0.1)' });
  });

  it('layered shadow array joins with ", "', () => {
    const tree: DTCGTree = {
      shadow: {
        elevated: {
          $value: [
            { color: '#000', offsetX: '0px', offsetY: '1px', blur: '2px', spread: '0px' },
            { color: '#000', offsetX: '0px', offsetY: '4px', blur: '8px', spread: '0px' },
          ],
          $type: 'shadow',
        },
      },
    };
    const out = toTailwindTheme(tree);
    expect(out.boxShadow).toEqual({
      elevated: '0px 1px 2px 0px #000, 0px 4px 8px 0px #000',
    });
  });

  it('combined fixture (color + fontSize + spacing) → correct Tailwind shape', () => {
    const tree: DTCGTree = {
      color: { primary: { $value: '#0066cc', $type: 'color' } },
      font: {
        size: { body: { $value: '16px', $type: 'dimension' } },
      },
      spacing: { '1': { $value: '4px', $type: 'dimension' } },
    };
    const out = toTailwindTheme(tree);
    expect(out).toEqual({
      colors: { primary: '#0066cc' },
      fontSize: { body: '16px' },
      spacing: { '1': '4px' },
    });
    // Slots without input must be omitted (no boxShadow, no fontFamily, no fontWeight).
    expect(Object.keys(out).sort()).toEqual(['colors', 'fontSize', 'spacing']);
  });

  it('empty tree → {}', () => {
    expect(toTailwindTheme({})).toEqual({});
  });

  it('returns a plain object, not an array', () => {
    const tree: DTCGTree = {
      color: { primary: { $value: '#0066cc', $type: 'color' } },
    };
    const out = toTailwindTheme(tree);
    expect(typeof out).toBe('object');
    expect(Array.isArray(out)).toBe(false);
    expect(Array.isArray(out.colors)).toBe(false);
  });

  it('determinism: same input twice → JSON.stringify byte-identical', () => {
    const tree: DTCGTree = {
      color: {
        gray: {
          '500': { $value: '#808080', $type: 'color' },
          '100': { $value: '#f5f5f5', $type: 'color' },
        },
        primary: { $value: '#0066cc', $type: 'color' },
      },
      spacing: {
        '4': { $value: '16px', $type: 'dimension' },
        '1': { $value: '4px', $type: 'dimension' },
      },
    };
    expect(JSON.stringify(toTailwindTheme(tree))).toBe(JSON.stringify(toTailwindTheme(tree)));

    // Insertion-order independence: same logical tree, different key order in source.
    const reordered: DTCGTree = {
      spacing: {
        '1': { $value: '4px', $type: 'dimension' },
        '4': { $value: '16px', $type: 'dimension' },
      },
      color: {
        primary: { $value: '#0066cc', $type: 'color' },
        gray: {
          '100': { $value: '#f5f5f5', $type: 'color' },
          '500': { $value: '#808080', $type: 'color' },
        },
      },
    };
    expect(JSON.stringify(toTailwindTheme(reordered))).toBe(
      JSON.stringify(toTailwindTheme(tree)),
    );
  });

  it('reference $value `{path.to.token}` is left as-is (F9 orchestrator resolves)', () => {
    const tree: DTCGTree = {
      color: {
        primary: { $value: '#0066cc', $type: 'color' },
        accent: { $value: '{color.primary}', $type: 'color' },
      },
    };
    const out = toTailwindTheme(tree);
    expect(out.colors).toEqual({
      primary: '#0066cc',
      accent: '{color.primary}',
    });
  });

  it('type mismatch: a color-typed leaf placed under font.size is dropped', () => {
    const tree: DTCGTree = {
      font: {
        size: {
          body: { $value: '16px', $type: 'dimension' },
          // Mistake: a color leaf in the font.size slot — must be skipped.
          rogue: { $value: '#ff0000', $type: 'color' },
        },
      },
    };
    const out = toTailwindTheme(tree);
    expect(out.fontSize).toEqual({ body: '16px' });
    expect(out.fontSize?.rogue).toBeUndefined();
  });

  it('output keys are restricted to the six mapped Tailwind slots', () => {
    const tree: DTCGTree = {
      color: { primary: { $value: '#0066cc', $type: 'color' } },
      font: {
        size: { body: { $value: '16px', $type: 'dimension' } },
        family: { sans: { $value: 'Inter', $type: 'fontFamily' } },
        weight: { regular: { $value: 400, $type: 'fontWeight' } },
      },
      spacing: { '1': { $value: '4px', $type: 'dimension' } },
      shadow: {
        sm: {
          $value: {
            color: '#000',
            offsetX: '0px',
            offsetY: '1px',
            blur: '2px',
            spread: '0px',
          },
          $type: 'shadow',
        },
      },
      // Garbage groups that have no Tailwind home — must be silently dropped.
      border: { thin: { $value: '1px', $type: 'dimension' } },
      duration: { fast: { $value: '100ms', $type: 'duration' } },
    };
    const out = toTailwindTheme(tree);
    expect(Object.keys(out).sort()).toEqual(
      ['boxShadow', 'colors', 'fontFamily', 'fontSize', 'fontWeight', 'spacing'].sort(),
    );
  });

  it('reserved DTCG group-level keys ($description, $extensions, $type) are skipped', () => {
    const tree: DTCGTree = {
      $description: 'root doc',
      color: {
        $type: 'color',
        $description: 'brand colors',
        $extensions: { 'com.example': { foo: 1 } },
        primary: { $value: '#0066cc' },
      },
    };
    const out = toTailwindTheme(tree);
    // Only `primary` should appear — the $-prefixed group metadata is filtered.
    expect(out.colors).toEqual({ primary: '#0066cc' });
  });

  it('empty slot subtree → slot key omitted (no boxShadow: {})', () => {
    const tree: DTCGTree = {
      color: { primary: { $value: '#0066cc', $type: 'color' } },
      shadow: {
        // Group exists but has no leaves — must not surface an empty boxShadow.
      },
    };
    const out = toTailwindTheme(tree);
    expect(out.boxShadow).toBeUndefined();
    expect('boxShadow' in out).toBe(false);
  });
});

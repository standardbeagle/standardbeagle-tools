import { describe, it, expect } from 'vitest';
import { toStyleDictionary } from './style-dictionary.js';
import type { DTCGTree } from '../schema/dtcg.js';

describe('toStyleDictionary', () => {
  it('flat color token → { color: { primary: { value: "#0066cc" } } }', () => {
    const tree: DTCGTree = {
      color: {
        primary: { $value: '#0066cc', $type: 'color' },
      },
    };
    expect(toStyleDictionary(tree)).toEqual({
      color: { primary: { value: '#0066cc' } },
    });
  });

  it('nested group preserved → { color: { gray: { "100": { value: "#f5f5f5" } } } }', () => {
    const tree: DTCGTree = {
      color: {
        gray: {
          '100': { $value: '#f5f5f5', $type: 'color' },
        },
      },
    };
    expect(toStyleDictionary(tree)).toEqual({
      color: { gray: { '100': { value: '#f5f5f5' } } },
    });
  });

  it('strict DTCG reference passes through unchanged (SD v5 resolves it natively)', () => {
    const tree: DTCGTree = {
      color: {
        primary: { $value: '#000', $type: 'color' },
        accent: { $value: '{color.primary}', $type: 'color' },
      },
    };
    const out = toStyleDictionary(tree) as {
      color: { primary: { value: string }; accent: { value: string } };
    };
    // SD v5 resolves DTCG-style refs without `.value` suffix (v4 needed it; v5 doesn't).
    expect(out.color.accent.value).toBe('{color.primary}');
    expect(out.color.primary.value).toBe('#000');
  });

  it('$type, $description, $extensions stripped from leaves', () => {
    const tree: DTCGTree = {
      color: {
        primary: {
          $value: '#0066cc',
          $type: 'color',
          $description: 'Brand primary',
          $extensions: { 'com.example': { foo: 1 } },
        },
      },
    };
    const out = toStyleDictionary(tree) as {
      color: { primary: Record<string, unknown> };
    };
    expect(out.color.primary).toEqual({ value: '#0066cc' });
    expect(Object.keys(out.color.primary)).toEqual(['value']);
  });

  it('group-level DTCG meta keys ($type, $description, $extensions) skipped', () => {
    const tree: DTCGTree = {
      $description: 'root doc',
      color: {
        $type: 'color',
        $description: 'brand colors',
        $extensions: { 'com.example': { foo: 1 } },
        primary: { $value: '#0066cc', $type: 'color' },
      },
    };
    const out = toStyleDictionary(tree);
    expect(out).toEqual({
      color: { primary: { value: '#0066cc' } },
    });
  });

  it('empty tree → {}', () => {
    expect(toStyleDictionary({})).toEqual({});
  });

  it('determinism: JSON.stringify byte-identical regardless of insertion order', () => {
    const a: DTCGTree = {
      color: {
        primary: { $value: '#0066cc', $type: 'color' },
        secondary: { $value: '#ff0000', $type: 'color' },
      },
      spacing: {
        '0': { $value: '0px', $type: 'dimension' },
        '1': { $value: '4px', $type: 'dimension' },
      },
    };
    const b: DTCGTree = {
      spacing: {
        '1': { $value: '4px', $type: 'dimension' },
        '0': { $value: '0px', $type: 'dimension' },
      },
      color: {
        secondary: { $value: '#ff0000', $type: 'color' },
        primary: { $value: '#0066cc', $type: 'color' },
      },
    };
    expect(JSON.stringify(toStyleDictionary(a))).toBe(
      JSON.stringify(toStyleDictionary(b)),
    );
  });

  it('non-strict reference (with surrounding text) is left untouched', () => {
    const tree: DTCGTree = {
      color: {
        primary: { $value: '#0066cc', $type: 'color' },
        bad: { $value: 'calc({color.primary} + 1px)', $type: 'color' },
      },
    };
    const out = toStyleDictionary(tree) as {
      color: { bad: { value: string } };
    };
    expect(out.color.bad.value).toBe('calc({color.primary} + 1px)');
    expect(out.color.bad.value).not.toContain('.value');
  });

  it('non-string scalar values pass through unchanged', () => {
    const tree: DTCGTree = {
      opacity: { half: { $value: 0.5, $type: 'number' } },
      flag: { on: { $value: true, $type: 'number' } },
    };
    const out = toStyleDictionary(tree) as {
      opacity: { half: { value: number } };
      flag: { on: { value: boolean } };
    };
    expect(out.opacity.half.value).toBe(0.5);
    expect(out.flag.on.value).toBe(true);
  });

  it('integration: Style Dictionary v5 builds CSS from the transformed object', async () => {
    // Round-trip: DTCG → SD input → SD CSS → contains expected --color-primary line.
    // F3 css-vars output for the same tree is `--color-primary: #0066cc;` — the SD
    // build reproduces that variable line (selector wrap differs: SD wraps in :root,
    // F3 also wraps in :root, but SD prepends a banner comment — only the variable
    // line is asserted byte-equal here).
    const SD = (await import('style-dictionary')).default;
    const tree: DTCGTree = {
      color: {
        primary: { $value: '#0066cc', $type: 'color' },
        gray: {
          '100': { $value: '#f5f5f5', $type: 'color' },
        },
      },
    };
    const sdInput = toStyleDictionary(tree) as Record<string, unknown>;
    const sd = new SD({
      // SD's `tokens` typing demands a recursive DesignTokens record; our
      // exporter returns a structurally-equivalent `object`, so cast.
      tokens: sdInput as never,
      platforms: {
        css: {
          transformGroup: 'css',
          files: [{ destination: 'tokens.css', format: 'css/variables' }],
        },
      },
    });
    const built = await sd.formatPlatform('css');
    const css = built[0]!.output as string;
    expect(css).toContain('--color-primary: #0066cc;');
    expect(css).toContain('--color-gray-100: #f5f5f5;');
  });

  it('integration: Style Dictionary v5 resolves rewritten references', async () => {
    const SD = (await import('style-dictionary')).default;
    const tree: DTCGTree = {
      color: {
        primary: { $value: '#0066cc', $type: 'color' },
        accent: { $value: '{color.primary}', $type: 'color' },
      },
    };
    const sd = new SD({
      tokens: toStyleDictionary(tree) as never,
      platforms: {
        css: {
          transformGroup: 'css',
          files: [{ destination: 'tokens.css', format: 'css/variables' }],
        },
      },
    });
    const built = await sd.formatPlatform('css');
    const css = built[0]!.output as string;
    // Both vars present, both with the same resolved color.
    expect(css).toContain('--color-primary: #0066cc;');
    expect(css).toContain('--color-accent: #0066cc;');
  });
});

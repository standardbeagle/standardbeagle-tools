import { describe, it, expect } from 'vitest';
import { toFigmaTokens } from './figma-tokens.js';
import type { DTCGTree } from '../schema/dtcg.js';

describe('toFigmaTokens', () => {
  it('flat color → { global: { color: { primary: { value, type: "color" } } } }', () => {
    const tree: DTCGTree = {
      color: {
        primary: { $value: '#0066cc', $type: 'color' },
      },
    };
    expect(toFigmaTokens(tree)).toEqual({
      global: {
        color: {
          primary: { value: '#0066cc', type: 'color' },
        },
      },
    });
  });

  it('empty tree → { global: {} }', () => {
    expect(toFigmaTokens({})).toEqual({ global: {} });
  });

  it('all 13 DTCG $type values remap to expected Tokens Studio types', () => {
    // Each row: [dtcg $type, dtcg $value sample, expected Tokens Studio type].
    // dimension is path-aware and tested separately below; here the leaf is
    // not under any `spacing` ancestor, so the expected remap is `sizing`.
    const cases: Array<[string, unknown, string]> = [
      ['color', '#0066cc', 'color'],
      ['dimension', '16px', 'sizing'],
      ['fontFamily', 'Inter', 'fontFamilies'],
      ['fontWeight', 700, 'fontWeights'],
      ['duration', '200ms', 'duration'],
      ['cubicBezier', [0.4, 0, 0.2, 1], 'cubicBezier'],
      ['number', 1.5, 'number'],
      ['strokeStyle', 'solid', 'strokeStyle'],
      ['border', { color: '#000', width: '1px', style: 'solid' }, 'border'],
      [
        'transition',
        { duration: '200ms', delay: '0ms', timingFunction: [0, 0, 1, 1] },
        'transition',
      ],
      [
        'shadow',
        {
          color: '#000',
          offsetX: '0px',
          offsetY: '2px',
          blur: '4px',
          spread: '0px',
        },
        'boxShadow',
      ],
      [
        'gradient',
        [
          { color: '#000', position: 0 },
          { color: '#fff', position: 1 },
        ],
        'color',
      ],
      [
        'typography',
        { fontFamily: 'Inter', fontSize: '16px', fontWeight: 400, lineHeight: 1.5 },
        'typography',
      ],
    ];

    for (const [dtcgType, dtcgValue, expectedType] of cases) {
      const tree: DTCGTree = {
        sample: {
          token: { $value: dtcgValue, $type: dtcgType },
        },
      };
      const out = toFigmaTokens(tree) as {
        global: { sample: { token: { value: unknown; type: string } } };
      };
      expect(out.global.sample.token.type).toBe(expectedType);
      expect(out.global.sample.token.value).toEqual(dtcgValue);
    }
  });

  it('path-aware dimension: token under spacing.* → "spacing", elsewhere → "sizing"', () => {
    const tree: DTCGTree = {
      spacing: {
        sm: { $value: '8px', $type: 'dimension' },
        nested: {
          xs: { $value: '4px', $type: 'dimension' },
        },
      },
      font: {
        size: {
          base: { $value: '16px', $type: 'dimension' },
        },
      },
      radius: {
        md: { $value: '6px', $type: 'dimension' },
      },
    };
    const out = toFigmaTokens(tree) as {
      global: {
        spacing: {
          sm: { type: string };
          nested: { xs: { type: string } };
        };
        font: { size: { base: { type: string } } };
        radius: { md: { type: string } };
      };
    };
    expect(out.global.spacing.sm.type).toBe('spacing');
    expect(out.global.spacing.nested.xs.type).toBe('spacing');
    expect(out.global.font.size.base.type).toBe('sizing');
    expect(out.global.radius.md.type).toBe('sizing');
  });

  it('reference values pass through unchanged in {color.primary} form', () => {
    const tree: DTCGTree = {
      color: {
        primary: { $value: '#0066cc', $type: 'color' },
        accent: { $value: '{color.primary}', $type: 'color' },
      },
    };
    const out = toFigmaTokens(tree) as {
      global: { color: { accent: { value: string }; primary: { value: string } } };
    };
    expect(out.global.color.accent.value).toBe('{color.primary}');
    expect(out.global.color.primary.value).toBe('#0066cc');
  });

  it('nested groups preserved: color.gray.100 → global.color.gray["100"]', () => {
    const tree: DTCGTree = {
      color: {
        gray: {
          '100': { $value: '#f5f5f5', $type: 'color' },
          '900': { $value: '#111111', $type: 'color' },
        },
      },
    };
    const out = toFigmaTokens(tree) as {
      global: {
        color: {
          gray: { '100': { value: string; type: string }; '900': { value: string } };
        };
      };
    };
    expect(out.global.color.gray['100']).toEqual({ value: '#f5f5f5', type: 'color' });
    expect(out.global.color.gray['900']).toEqual({ value: '#111111', type: 'color' });
  });

  it('group-level $description, $extensions, $type are stripped from output', () => {
    const tree: DTCGTree = {
      $description: 'root doc',
      color: {
        $type: 'color',
        $description: 'brand colors',
        $extensions: { 'com.example': { foo: 1 } },
        primary: { $value: '#0066cc' }, // no $type — inherits from group
      },
    };
    const out = toFigmaTokens(tree);
    expect(out).toEqual({
      global: {
        color: {
          primary: { value: '#0066cc', type: 'color' },
        },
      },
    });
  });

  it('leaf-level $description and $extensions are stripped from output', () => {
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
    const out = toFigmaTokens(tree) as {
      global: { color: { primary: Record<string, unknown> } };
    };
    expect(out.global.color.primary).toEqual({ value: '#0066cc', type: 'color' });
    expect(Object.keys(out.global.color.primary).sort()).toEqual(['type', 'value']);
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
    expect(JSON.stringify(toFigmaTokens(a))).toBe(JSON.stringify(toFigmaTokens(b)));
  });

  it('output is valid JSON (round-trips through JSON.parse(JSON.stringify(...)))', () => {
    const tree: DTCGTree = {
      color: {
        primary: { $value: '#0066cc', $type: 'color' },
      },
      spacing: {
        sm: { $value: '8px', $type: 'dimension' },
      },
      typography: {
        body: {
          $value: { fontFamily: 'Inter', fontSize: '16px', fontWeight: 400, lineHeight: 1.5 },
          $type: 'typography',
        },
      },
    };
    const out = toFigmaTokens(tree);
    const roundTripped = JSON.parse(JSON.stringify(out));
    expect(roundTripped).toEqual(out);
  });

  it('inherits $type from ancestor group when leaf omits its own $type', () => {
    const tree: DTCGTree = {
      color: {
        $type: 'color',
        primary: { $value: '#0066cc' },
        accent: { $value: '#ff6600' },
      },
    };
    const out = toFigmaTokens(tree) as {
      global: { color: { primary: { type: string }; accent: { type: string } } };
    };
    expect(out.global.color.primary.type).toBe('color');
    expect(out.global.color.accent.type).toBe('color');
  });

  it('leaf with no resolvable $type emits no `type` key', () => {
    const tree: DTCGTree = {
      mystery: {
        thing: { $value: 'whatever' },
      },
    };
    const out = toFigmaTokens(tree) as {
      global: { mystery: { thing: Record<string, unknown> } };
    };
    expect(out.global.mystery.thing).toEqual({ value: 'whatever' });
    expect('type' in out.global.mystery.thing).toBe(false);
  });

  it('top-level wrapper is exactly { global: ... } with no other sibling keys', () => {
    const tree: DTCGTree = {
      color: { primary: { $value: '#0066cc', $type: 'color' } },
    };
    const out = toFigmaTokens(tree);
    expect(Object.keys(out)).toEqual(['global']);
  });
});

import { describe, it, expect } from 'vitest';
import { tokensGenerate } from './tokens-generate.js';
import { tokensValidate } from './tokens-validate.js';
import { TokensGenerateInputSchema } from './tokens-generate.schema.js';

/**
 * Build the parsed/defaulted input the handler expects, threading whatever the test
 * supplies through the same Zod default-application path the server uses at runtime.
 */
function input(overrides: Record<string, unknown> = {}) {
  return TokensGenerateInputSchema.parse(overrides);
}

describe('tokensGenerate', () => {
  describe('default inputs', () => {
    it('empty palette → well-formed DTCG tree that passes tokens_validate', () => {
      const tree = tokensGenerate(input({ palette: {} }));

      // Top-level groups present.
      expect(tree).toHaveProperty('color');
      expect(tree).toHaveProperty('font.size');
      expect(tree).toHaveProperty('spacing');

      // F1 conformance gate: result must pass tokens_validate in strict mode.
      const v = tokensValidate({ tokens: tree, strict: true });
      expect(v.valid).toBe(true);
      expect(v.errors).toEqual([]);
    });

    it('default font.size emits 9 named steps and body resolves to base px', () => {
      const tree = tokensGenerate(input({}));
      const sizes = tree.font.size as Record<string, { $value: string; $type: string }>;
      const names = Object.keys(sizes);
      expect(names).toEqual([
        'caption',
        'small',
        'body',
        'h6',
        'h5',
        'h4',
        'h3',
        'h2',
        'h1',
      ]);
      expect(sizes.body!.$value).toBe('16px');
      expect(sizes.body!.$type).toBe('dimension');
    });
  });

  describe('palette', () => {
    it('multiple colors all appear under color.* with $type: "color"', () => {
      const tree = tokensGenerate(
        input({
          palette: { primary: '#0066cc', accent: '#ff5500', neutral: '#888888' },
        }),
      );
      const color = tree.color as Record<string, { $value: string; $type: string }>;
      expect(Object.keys(color).sort()).toEqual(['accent', 'neutral', 'primary']);
      expect(color.primary).toEqual({ $value: '#0066cc', $type: 'color' });
      expect(color.accent).toEqual({ $value: '#ff5500', $type: 'color' });
      expect(color.neutral).toEqual({ $value: '#888888', $type: 'color' });

      // F1 conformance still holds with multi-color palette.
      expect(tokensValidate({ tokens: tree, strict: true }).valid).toBe(true);
    });
  });

  describe('type_scale ratio', () => {
    it('ratio 1.5 yields a larger h1 than default ratio 1.25 at the same base', () => {
      const big = tokensGenerate(input({ type_scale: { base: 16, ratio: 1.5 } }));
      const small = tokensGenerate(input({ type_scale: { base: 16, ratio: 1.25 } }));
      const bigH1 = (big.font.size as Record<string, { $value: string }>).h1!.$value;
      const smallH1 = (small.font.size as Record<string, { $value: string }>).h1!.$value;
      const bigPx = parseInt(bigH1, 10);
      const smallPx = parseInt(smallH1, 10);
      expect(bigPx).toBeGreaterThan(smallPx);
      // Spec values: 16*1.5^6 ≈ 182.25 → 182px; 16*1.25^6 ≈ 61.04 → 61px.
      expect(bigH1).toBe('182px');
      expect(smallH1).toBe('61px');
    });
  });

  describe('spacing steps', () => {
    it('steps:5 → exactly 6 entries (spacing.0 .. spacing.5)', () => {
      const tree = tokensGenerate(input({ spacing: { base: 4, steps: 5 } }));
      const spacing = tree.spacing as Record<string, { $value: string; $type: string }>;
      const keys = Object.keys(spacing);
      expect(keys).toHaveLength(6);
      expect(keys).toEqual(['0', '1', '2', '3', '4', '5']);
      expect(spacing['0']!.$value).toBe('0px');
      expect(spacing['5']!.$value).toBe('20px');
      expect(spacing['5']!.$type).toBe('dimension');
    });
  });

  describe('determinism', () => {
    it('two calls with identical input yield byte-identical JSON', () => {
      const cfg = {
        palette: { primary: '#0066cc', accent: '#ff5500' },
        type_scale: { base: 16, ratio: 1.25 },
        spacing: { base: 4, steps: 10 },
      };
      const a = JSON.stringify(tokensGenerate(input(cfg)));
      const b = JSON.stringify(tokensGenerate(input(cfg)));
      expect(a).toBe(b);
    });
  });

  describe('F1 conformance gate', () => {
    it('full realistic palette + custom scales → tokens_validate strict valid:true', () => {
      const tree = tokensGenerate(
        input({
          palette: {
            primary: '#0066cc',
            secondary: '#6b46c1',
            success: '#22c55e',
            danger: '#ef4444',
            neutral: '#737373',
          },
          type_scale: { base: 18, ratio: 1.333 },
          spacing: { base: 8, steps: 12 },
        }),
      );
      const v = tokensValidate({ tokens: tree, strict: true });
      expect(v.valid).toBe(true);
      expect(v.errors).toEqual([]);
      expect(v.warnings).toEqual([]);
    });
  });
});

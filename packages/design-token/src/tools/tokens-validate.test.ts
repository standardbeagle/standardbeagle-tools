import { describe, it, expect } from 'vitest';
import { tokensValidate } from './tokens-validate.js';
import { DtcgIssueCode, DtcgTypes } from '../schema/dtcg.js';

describe('tokensValidate', () => {
  describe('basic shape', () => {
    it('empty tokens object → valid: true with empty arrays', () => {
      const out = tokensValidate({ tokens: {}, strict: false });
      expect(out.valid).toBe(true);
      expect(out.errors).toEqual([]);
      expect(out.warnings).toEqual([]);
    });

    it('valid color leaf at root → valid: true', () => {
      const out = tokensValidate({
        tokens: { primary: { $value: '#ff0000', $type: 'color' } },
        strict: false,
      });
      expect(out.valid).toBe(true);
      expect(out.errors).toHaveLength(0);
    });

    it('nested group with inherited path → valid: true and dotted path works', () => {
      const out = tokensValidate({
        tokens: {
          color: {
            brand: {
              primary: { $value: '#000', $type: 'color' },
              accent: { $value: '#fff', $type: 'color' },
            },
          },
        },
        strict: false,
      });
      expect(out.valid).toBe(true);
    });
  });

  describe('error: MISSING_VALUE', () => {
    it('node has $type but no $value → MISSING_VALUE error with correct path', () => {
      const out = tokensValidate({
        tokens: { broken: { $type: 'color' } },
        strict: false,
      });
      expect(out.valid).toBe(false);
      expect(out.errors).toHaveLength(1);
      expect(out.errors[0]!.code).toBe(DtcgIssueCode.MISSING_VALUE);
      expect(out.errors[0]!.path).toBe('broken');
    });
  });

  describe('error: MISSING_TYPE', () => {
    it('token with $value but no $type and no inherited type → MISSING_TYPE error', () => {
      const out = tokensValidate({
        tokens: { lonely: { $value: '#fff' } },
        strict: false,
      });
      expect(out.valid).toBe(false);
      expect(out.errors[0]!.code).toBe(DtcgIssueCode.MISSING_TYPE);
    });

    it('token inherits $type from ancestor group → no MISSING_TYPE error', () => {
      const out = tokensValidate({
        tokens: {
          colors: {
            $type: 'color',
            primary: { $value: '#ff0000' },
            secondary: { $value: '#00ff00' },
          },
        },
        strict: false,
      });
      expect(out.valid).toBe(true);
    });
  });

  describe('strict mode: UNKNOWN_TYPE', () => {
    it('unknown $type "banana" with strict:false → warning, valid stays true', () => {
      const out = tokensValidate({
        tokens: { weird: { $value: 'whatever', $type: 'banana' } },
        strict: false,
      });
      expect(out.valid).toBe(true);
      expect(out.warnings).toHaveLength(1);
      expect(out.warnings[0]!.code).toBe(DtcgIssueCode.UNKNOWN_TYPE);
      expect(out.errors).toHaveLength(0);
    });

    it('unknown $type "banana" with strict:true → error, valid:false', () => {
      const out = tokensValidate({
        tokens: { weird: { $value: 'whatever', $type: 'banana' } },
        strict: true,
      });
      expect(out.valid).toBe(false);
      expect(out.errors).toHaveLength(1);
      expect(out.errors[0]!.code).toBe(DtcgIssueCode.UNKNOWN_TYPE);
    });
  });

  describe('all 12 DTCG $type values — positive cases', () => {
    it('color: hex', () => {
      const out = tokensValidate({
        tokens: { t: { $value: '#abcdef', $type: 'color' } },
        strict: true,
      });
      expect(out.valid).toBe(true);
    });

    it('dimension: px string', () => {
      const out = tokensValidate({
        tokens: { t: { $value: '16px', $type: 'dimension' } },
        strict: true,
      });
      expect(out.valid).toBe(true);
    });

    it('fontFamily: array of fallbacks', () => {
      const out = tokensValidate({
        tokens: { t: { $value: ['Inter', 'system-ui', 'sans-serif'], $type: 'fontFamily' } },
        strict: true,
      });
      expect(out.valid).toBe(true);
    });

    it('fontWeight: numeric', () => {
      const out = tokensValidate({
        tokens: { t: { $value: 700, $type: 'fontWeight' } },
        strict: true,
      });
      expect(out.valid).toBe(true);
    });

    it('duration: ms string', () => {
      const out = tokensValidate({
        tokens: { t: { $value: '300ms', $type: 'duration' } },
        strict: true,
      });
      expect(out.valid).toBe(true);
    });

    it('cubicBezier: 4-tuple with x1,x2 in [0,1]', () => {
      const out = tokensValidate({
        tokens: { t: { $value: [0.25, 0.1, 0.25, 1], $type: 'cubicBezier' } },
        strict: true,
      });
      expect(out.valid).toBe(true);
    });

    it('number: finite number', () => {
      const out = tokensValidate({
        tokens: { t: { $value: 1.5, $type: 'number' } },
        strict: true,
      });
      expect(out.valid).toBe(true);
    });

    it('strokeStyle: keyword', () => {
      const out = tokensValidate({
        tokens: { t: { $value: 'dashed', $type: 'strokeStyle' } },
        strict: true,
      });
      expect(out.valid).toBe(true);
    });

    it('border: composite', () => {
      const out = tokensValidate({
        tokens: {
          t: {
            $value: { color: '#000', width: '1px', style: 'solid' },
            $type: 'border',
          },
        },
        strict: true,
      });
      expect(out.valid).toBe(true);
    });

    it('transition: composite', () => {
      const out = tokensValidate({
        tokens: {
          t: {
            $value: { duration: '200ms', delay: '0ms', timingFunction: [0, 0, 1, 1] },
            $type: 'transition',
          },
        },
        strict: true,
      });
      expect(out.valid).toBe(true);
    });

    it('shadow: single composite', () => {
      const out = tokensValidate({
        tokens: {
          t: {
            $value: {
              color: '#000',
              offsetX: '0px',
              offsetY: '2px',
              blur: '4px',
              spread: '0px',
            },
            $type: 'shadow',
          },
        },
        strict: true,
      });
      expect(out.valid).toBe(true);
    });

    it('gradient: array of stops', () => {
      const out = tokensValidate({
        tokens: {
          t: {
            $value: [
              { color: '#000', position: 0 },
              { color: '#fff', position: 1 },
            ],
            $type: 'gradient',
          },
        },
        strict: true,
      });
      expect(out.valid).toBe(true);
    });

    it('typography: composite', () => {
      const out = tokensValidate({
        tokens: {
          t: {
            $value: {
              fontFamily: 'Inter',
              fontSize: '16px',
              fontWeight: 500,
              lineHeight: 1.5,
            },
            $type: 'typography',
          },
        },
        strict: true,
      });
      expect(out.valid).toBe(true);
    });

    it('DtcgTypes export covers all 12 spec types', () => {
      expect(DtcgTypes).toHaveLength(13);
      // 13 because the spec lists "number" alongside "dimension"; all 13 listed in task spec.
      const expected = [
        'color',
        'dimension',
        'fontFamily',
        'fontWeight',
        'duration',
        'cubicBezier',
        'number',
        'strokeStyle',
        'border',
        'transition',
        'shadow',
        'gradient',
        'typography',
      ];
      expect([...DtcgTypes].sort()).toEqual([...expected].sort());
    });
  });

  describe('error: INVALID_VALUE', () => {
    it('color with garbage value → INVALID_VALUE error', () => {
      const out = tokensValidate({
        tokens: { bad: { $value: '###not-a-color###', $type: 'color' } },
        strict: false,
      });
      expect(out.valid).toBe(false);
      expect(out.errors[0]!.code).toBe(DtcgIssueCode.INVALID_VALUE);
    });

    it('dimension with bad unit → INVALID_VALUE error', () => {
      const out = tokensValidate({
        tokens: { bad: { $value: '16xq', $type: 'dimension' } },
        strict: false,
      });
      expect(out.valid).toBe(false);
      expect(out.errors[0]!.code).toBe(DtcgIssueCode.INVALID_VALUE);
    });

    it('cubicBezier with x1 out of [0,1] → INVALID_VALUE error', () => {
      const out = tokensValidate({
        tokens: { bad: { $value: [1.5, 0, 0.5, 1], $type: 'cubicBezier' } },
        strict: false,
      });
      expect(out.valid).toBe(false);
      expect(out.errors[0]!.code).toBe(DtcgIssueCode.INVALID_VALUE);
    });

    it('fontWeight: 1500 (out of range) → INVALID_VALUE', () => {
      const out = tokensValidate({
        tokens: { bad: { $value: 1500, $type: 'fontWeight' } },
        strict: false,
      });
      expect(out.valid).toBe(false);
      expect(out.errors[0]!.code).toBe(DtcgIssueCode.INVALID_VALUE);
    });

    it('gradient with only 1 stop → INVALID_VALUE (need at least 2)', () => {
      const out = tokensValidate({
        tokens: {
          bad: {
            $value: [{ color: '#000', position: 0 }],
            $type: 'gradient',
          },
        },
        strict: false,
      });
      expect(out.valid).toBe(false);
      expect(out.errors[0]!.code).toBe(DtcgIssueCode.INVALID_VALUE);
    });
  });

  describe('path tracking', () => {
    it('deep nested error reports dotted path', () => {
      const out = tokensValidate({
        tokens: {
          color: {
            brand: {
              primary: { $value: 'not-a-color-####', $type: 'color' },
            },
          },
        },
        strict: false,
      });
      expect(out.valid).toBe(false);
      expect(out.errors[0]!.path).toBe('color.brand.primary');
    });
  });

  describe('mixed batch', () => {
    it('one valid + one invalid → valid:false, error path is the invalid one', () => {
      const out = tokensValidate({
        tokens: {
          good: { $value: '#ff0000', $type: 'color' },
          bad: { $value: 'xyz###', $type: 'color' },
        },
        strict: false,
      });
      expect(out.valid).toBe(false);
      expect(out.errors).toHaveLength(1);
      expect(out.errors[0]!.path).toBe('bad');
    });
  });
});

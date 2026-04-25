import { describe, it, expect } from 'vitest';
import { tokensMerge } from './tokens-merge.js';
import { TokensMergeInputSchema } from './tokens-merge.schema.js';

describe('tokensMerge', () => {
  it('base only, no overrides → merged equals base, no conflicts', () => {
    const base = { color: { primary: { $value: '#ff0000', $type: 'color' } } };
    const out = tokensMerge({
      base,
      overrides: [],
      conflict_resolution: 'last-wins',
    });
    expect(out.merged).toEqual(base);
    expect(out.conflicts).toEqual([]);
  });

  it('base + override, last-wins → override value used, conflict reported', () => {
    const base = { color: { primary: { $value: '#000', $type: 'color' } } };
    const override = { color: { primary: { $value: '#fff', $type: 'color' } } };
    const out = tokensMerge({
      base,
      overrides: [override],
      conflict_resolution: 'last-wins',
    });
    expect((out.merged as { color: { primary: { $value: string } } }).color.primary.$value).toBe('#fff');
    expect(out.conflicts).toHaveLength(1);
    expect(out.conflicts[0]!.path).toBe('color.primary');
    expect(out.conflicts[0]!.sources).toHaveLength(2);
    expect(out.conflicts[0]!.sources[0]!.source_index).toBe(-1);
    expect(out.conflicts[0]!.sources[1]!.source_index).toBe(0);
  });

  it('base + override, first-wins → base value retained, conflict still reported', () => {
    const base = { color: { primary: { $value: '#000', $type: 'color' } } };
    const override = { color: { primary: { $value: '#fff', $type: 'color' } } };
    const out = tokensMerge({
      base,
      overrides: [override],
      conflict_resolution: 'first-wins',
    });
    expect((out.merged as { color: { primary: { $value: string } } }).color.primary.$value).toBe('#000');
    expect(out.conflicts).toHaveLength(1);
    expect(out.conflicts[0]!.path).toBe('color.primary');
  });

  it('error mode throws with conflict payload', () => {
    const base = { brand: { $value: '#000', $type: 'color' } };
    const override = { brand: { $value: '#fff', $type: 'color' } };
    expect.assertions(3);
    try {
      tokensMerge({
        base,
        overrides: [override],
        conflict_resolution: 'error',
      });
    } catch (e) {
      const err = e as Error & { conflict?: { path: string; sources: unknown[] } };
      expect(err.message).toContain('brand');
      expect(err.conflict).toBeDefined();
      expect(err.conflict!.path).toBe('brand');
    }
  });

  it('structural conflict (leaf-vs-group) always throws regardless of mode', () => {
    // base treats `color.primary` as a leaf; override treats it as a group with `color.primary.50`.
    const base = { color: { primary: { $value: '#000', $type: 'color' } } };
    const override = {
      color: { primary: { 50: { $value: '#eee', $type: 'color' } } },
    };
    for (const mode of ['last-wins', 'first-wins', 'error'] as const) {
      expect(() =>
        tokensMerge({ base, overrides: [override], conflict_resolution: mode }),
      ).toThrow(/structural conflict/);
    }
  });

  it('multi-override left-to-right semantics for last-wins', () => {
    const base = { x: { $value: '1', $type: 'number' } };
    const o1 = { x: { $value: '2', $type: 'number' } };
    const o2 = { x: { $value: '3', $type: 'number' } };
    const o3 = { x: { $value: '4', $type: 'number' } };
    const out = tokensMerge({
      base,
      overrides: [o1, o2, o3],
      conflict_resolution: 'last-wins',
    });
    expect((out.merged as { x: { $value: string } }).x.$value).toBe('4');
    expect(out.conflicts).toHaveLength(1);
    // Sources ordered by source_index ascending: -1, 0, 1, 2
    expect(out.conflicts[0]!.sources.map((s) => s.source_index)).toEqual([-1, 0, 1, 2]);
  });

  it('multi-override left-to-right semantics for first-wins (base wins if base has it)', () => {
    const base = { x: { $value: '1', $type: 'number' } };
    const o1 = { x: { $value: '2', $type: 'number' } };
    const o2 = { x: { $value: '3', $type: 'number' } };
    const out = tokensMerge({
      base,
      overrides: [o1, o2],
      conflict_resolution: 'first-wins',
    });
    expect((out.merged as { x: { $value: string } }).x.$value).toBe('1');
  });

  it('first-wins with no base contribution: earliest override wins', () => {
    const base = {};
    const o1 = { x: { $value: '2', $type: 'number' } };
    const o2 = { x: { $value: '3', $type: 'number' } };
    const out = tokensMerge({
      base,
      overrides: [o1, o2],
      conflict_resolution: 'first-wins',
    });
    expect((out.merged as { x: { $value: string } }).x.$value).toBe('2');
  });

  it('non-conflicting overrides are merged additively, no conflicts', () => {
    const base = { color: { primary: { $value: '#000', $type: 'color' } } };
    const override = { spacing: { sm: { $value: '4px', $type: 'dimension' } } };
    const out = tokensMerge({
      base,
      overrides: [override],
      conflict_resolution: 'last-wins',
    });
    expect((out.merged as { color: { primary: { $value: string } } }).color.primary.$value).toBe('#000');
    expect((out.merged as { spacing: { sm: { $value: string } } }).spacing.sm.$value).toBe('4px');
    expect(out.conflicts).toEqual([]);
  });

  it('deterministic: same inputs produce byte-identical JSON output', () => {
    const base = {
      color: {
        primary: { $value: '#000', $type: 'color' },
        secondary: { $value: '#111', $type: 'color' },
      },
    };
    const override = {
      color: {
        primary: { $value: '#fff', $type: 'color' },
        accent: { $value: '#eee', $type: 'color' },
      },
    };
    const r1 = tokensMerge({ base, overrides: [override], conflict_resolution: 'last-wins' });
    const r2 = tokensMerge({ base, overrides: [override], conflict_resolution: 'last-wins' });
    expect(JSON.stringify(r1)).toBe(JSON.stringify(r2));
  });

  it('conflict paths are sorted ascending', () => {
    const base = {
      z: { $value: '1', $type: 'number' },
      a: { $value: '2', $type: 'number' },
      m: { $value: '3', $type: 'number' },
    };
    const override = {
      z: { $value: '10', $type: 'number' },
      a: { $value: '20', $type: 'number' },
      m: { $value: '30', $type: 'number' },
    };
    const out = tokensMerge({
      base,
      overrides: [override],
      conflict_resolution: 'last-wins',
    });
    expect(out.conflicts.map((c) => c.path)).toEqual(['a', 'm', 'z']);
  });

  it('deeply nested merge preserves group structure', () => {
    const base = {
      color: {
        brand: {
          primary: { $value: '#000', $type: 'color' },
          secondary: { $value: '#111', $type: 'color' },
        },
      },
    };
    const override = {
      color: {
        brand: {
          primary: { $value: '#fff', $type: 'color' },
        },
      },
    };
    const out = tokensMerge({
      base,
      overrides: [override],
      conflict_resolution: 'last-wins',
    });
    const merged = out.merged as {
      color: { brand: { primary: { $value: string }; secondary: { $value: string } } };
    };
    expect(merged.color.brand.primary.$value).toBe('#fff');
    expect(merged.color.brand.secondary.$value).toBe('#111');
    expect(out.conflicts).toHaveLength(1);
    expect(out.conflicts[0]!.path).toBe('color.brand.primary');
  });

  it('default conflict_resolution is last-wins', () => {
    const base = { x: { $value: '1', $type: 'number' } };
    const override = { x: { $value: '2', $type: 'number' } };
    // Use schema default by omitting the field.
    const parsed = TokensMergeInputSchema.parse({ base, overrides: [override] });
    expect(parsed.conflict_resolution).toBe('last-wins');
    const out = tokensMerge(parsed);
    expect((out.merged as { x: { $value: string } }).x.$value).toBe('2');
  });
});

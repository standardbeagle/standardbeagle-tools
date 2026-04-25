import { describe, it, expect } from 'vitest';
import { tokensDiff } from './tokens-diff.js';

describe('tokensDiff', () => {
  it('identical trees → all empty arrays', () => {
    const tree = {
      color: { primary: { $value: '#ff0000', $type: 'color' } },
    };
    const out = tokensDiff({ a: tree, b: tree });
    expect(out.added).toEqual([]);
    expect(out.removed).toEqual([]);
    expect(out.changed).toEqual([]);
  });

  it('pure addition: b has new leaf → added populated, others empty', () => {
    const a = { color: { primary: { $value: '#ff0000', $type: 'color' } } };
    const b = {
      color: {
        primary: { $value: '#ff0000', $type: 'color' },
        accent: { $value: '#00ff00', $type: 'color' },
      },
    };
    const out = tokensDiff({ a, b });
    expect(out.removed).toEqual([]);
    expect(out.changed).toEqual([]);
    expect(out.added).toHaveLength(1);
    expect(out.added[0]!.path).toBe('color.accent');
    expect(out.added[0]!.value).toEqual({ $value: '#00ff00', $type: 'color' });
  });

  it('pure removal: a has leaf absent in b → removed populated', () => {
    const a = {
      color: {
        primary: { $value: '#ff0000', $type: 'color' },
        accent: { $value: '#00ff00', $type: 'color' },
      },
    };
    const b = { color: { primary: { $value: '#ff0000', $type: 'color' } } };
    const out = tokensDiff({ a, b });
    expect(out.added).toEqual([]);
    expect(out.changed).toEqual([]);
    expect(out.removed).toHaveLength(1);
    expect(out.removed[0]!.path).toBe('color.accent');
    expect(out.removed[0]!.value).toEqual({ $value: '#00ff00', $type: 'color' });
  });

  it('changed $value on existing path → changed populated with old/new', () => {
    const a = { brand: { $value: '#000000', $type: 'color' } };
    const b = { brand: { $value: '#111111', $type: 'color' } };
    const out = tokensDiff({ a, b });
    expect(out.added).toEqual([]);
    expect(out.removed).toEqual([]);
    expect(out.changed).toHaveLength(1);
    expect(out.changed[0]!.path).toBe('brand');
    expect((out.changed[0]!.old as { $value: string }).$value).toBe('#000000');
    expect((out.changed[0]!.new as { $value: string }).$value).toBe('#111111');
  });

  it('description-only edit → not reported as changed', () => {
    const a = {
      brand: { $value: '#000000', $type: 'color', $description: 'old' },
    };
    const b = {
      brand: { $value: '#000000', $type: 'color', $description: 'new' },
    };
    const out = tokensDiff({ a, b });
    expect(out.added).toEqual([]);
    expect(out.removed).toEqual([]);
    expect(out.changed).toEqual([]);
  });

  it('nested-group depth: path = color.brand.primary', () => {
    const a = {
      color: { brand: { primary: { $value: '#aaa', $type: 'color' } } },
    };
    const b = {
      color: { brand: { primary: { $value: '#bbb', $type: 'color' } } },
    };
    const out = tokensDiff({ a, b });
    expect(out.changed).toHaveLength(1);
    expect(out.changed[0]!.path).toBe('color.brand.primary');
  });

  it('mixed add+remove+change in one diff, output sorted by path', () => {
    const a = {
      color: {
        primary: { $value: '#000', $type: 'color' },
        secondary: { $value: '#111', $type: 'color' }, // removed
      },
      spacing: { sm: { $value: '4px', $type: 'dimension' } }, // changed
    };
    const b = {
      color: {
        primary: { $value: '#000', $type: 'color' },
        accent: { $value: '#fff', $type: 'color' }, // added
      },
      spacing: { sm: { $value: '8px', $type: 'dimension' } }, // changed
    };
    const out = tokensDiff({ a, b });

    expect(out.added).toHaveLength(1);
    expect(out.added[0]!.path).toBe('color.accent');

    expect(out.removed).toHaveLength(1);
    expect(out.removed[0]!.path).toBe('color.secondary');

    expect(out.changed).toHaveLength(1);
    expect(out.changed[0]!.path).toBe('spacing.sm');
  });

  it('deterministic output: same inputs produce byte-identical JSON', () => {
    const a = {
      z: { $value: '#000', $type: 'color' },
      a: { $value: '#fff', $type: 'color' },
    };
    const b = {
      m: { $value: '#888', $type: 'color' },
      a: { $value: '#fff', $type: 'color' },
    };
    const r1 = tokensDiff({ a, b });
    const r2 = tokensDiff({ a, b });
    expect(JSON.stringify(r1)).toEqual(JSON.stringify(r2));
    // Sorted: added=[m], removed=[z], changed=[]
    expect(r1.added.map((e) => e.path)).toEqual(['m']);
    expect(r1.removed.map((e) => e.path)).toEqual(['z']);
  });

  it('empty trees on both sides → all empty', () => {
    const out = tokensDiff({ a: {}, b: {} });
    expect(out).toEqual({ added: [], removed: [], changed: [] });
  });

  it('object-shaped $value (typography) deep-equality', () => {
    const a = {
      heading: {
        $value: { fontFamily: 'Inter', fontSize: '24px', fontWeight: 700, lineHeight: 1.2 },
        $type: 'typography',
      },
    };
    const b = {
      heading: {
        $value: { fontFamily: 'Inter', fontSize: '24px', fontWeight: 700, lineHeight: 1.2 },
        $type: 'typography',
      },
    };
    const out = tokensDiff({ a, b });
    expect(out.changed).toEqual([]);

    const c = {
      heading: {
        $value: { fontFamily: 'Inter', fontSize: '28px', fontWeight: 700, lineHeight: 1.2 },
        $type: 'typography',
      },
    };
    const out2 = tokensDiff({ a, b: c });
    expect(out2.changed).toHaveLength(1);
    expect(out2.changed[0]!.path).toBe('heading');
  });
});

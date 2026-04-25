import type { DTCGTree } from '../schema/dtcg.js';

/**
 * Pure, deterministic exporter: a DTCG token tree → a flat block of SCSS variable
 * declarations.
 *
 * Each leaf in the tree (any object with `$value`) becomes one `$<name>: <value>;`
 * line. Nested group names are joined with `-`, so `color.brand.primary` →
 * `$color-brand-primary`. An optional `prefix` is glued with `-` in front of every
 * variable name (e.g. `prefix: 'ds'` → `$ds-color-brand-primary`).
 *
 * DTCG references of the strict form `"{path.to.token}"` (the entire `$value` is a
 * single curly-brace pair around a dot-separated path) are rewritten to the
 * corresponding SCSS variable reference `$<prefixed-flattened-path>`. Partial
 * interpolation (e.g. `calc({color.primary} + 1px)`) is not part of the DTCG
 * aliasing spec and is therefore left untouched.
 *
 * Output is byte-stable across runs: keys are sorted alphabetically depth-first at
 * every level for the *initial* leaf list, then a topological reorder pulls each
 * referencing leaf below the leaf it references. Pure tiebreak is the original
 * alphabetical position. The line separator is `\n` and no trailing whitespace is
 * emitted.
 *
 * The toposort step is required because SCSS resolves `$ref` eagerly at the
 * declaration site, unlike CSS custom properties which lazily resolve at use.
 * Without it, a tree like `{ accent: '{color.primary}', primary: '#0066cc' }`
 * would emit `$color-accent: $color-primary;` *before* `$color-primary` was
 * declared, and dart-sass would fail with "Undefined variable".
 *
 * Pure — no I/O, no globals, no Date.now(), no Math.random(). Same input + same opts
 * yields character-identical output.
 *
 * Output parses cleanly via dart-sass. Unlike the CSS variables exporter, there is
 * no surrounding selector block — SCSS variables live at module scope.
 */

/** Reserved DTCG keys that must be skipped when walking groups. */
const RESERVED_KEYS = new Set(['$value', '$type', '$description', '$extensions']);

/** Strict DTCG alias form: the entire $value is `{a.b.c}` with no surrounding text. */
const REF_RE = /^\{([A-Za-z0-9_$][A-Za-z0-9_$.-]*)\}$/;

interface Leaf {
  /** Path segments from root, in tree order (pre-prefix, pre-join). */
  path: string[];
  /** The raw `$value` from the leaf (any DTCG-allowed shape). */
  value: unknown;
}

/**
 * Walk the tree depth-first, sorting child keys alphabetically at every level so
 * the resulting leaf list is fully determined by the input shape (insertion order
 * is intentionally ignored for stability).
 */
function collectLeaves(node: unknown, path: string[], out: Leaf[]): void {
  if (typeof node !== 'object' || node === null || Array.isArray(node)) return;

  const obj = node as Record<string, unknown>;
  if ('$value' in obj) {
    out.push({ path, value: obj.$value });
    return;
  }

  const childKeys = Object.keys(obj)
    .filter((k) => !RESERVED_KEYS.has(k))
    .sort();
  for (const key of childKeys) {
    collectLeaves(obj[key], [...path, key], out);
  }
}

/** Join path segments + optional prefix into an SCSS variable name (without leading `$`). */
function varName(path: string[], prefix: string | undefined): string {
  const segs = prefix ? [prefix, ...path] : path;
  return segs.join('-');
}

/**
 * Render a single `$value` into the right-hand side of an SCSS declaration.
 *  - Strict DTCG ref → `$<flattened-prefixed-name>`.
 *  - String / number / boolean → coerced to string.
 *  - Anything else (array, object) → JSON.stringify so output stays a single line and
 *    deterministic; composite DTCG types (shadow, typography, …) don't have a single
 *    canonical SCSS form, so this is the safest stable fallback.
 */
function renderValue(value: unknown, prefix: string | undefined): string {
  if (typeof value === 'string') {
    const m = REF_RE.exec(value);
    if (m) {
      const refPath = m[1]!.split('.');
      return `$${varName(refPath, prefix)}`;
    }
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return JSON.stringify(value);
}

export interface ToScssOptions {
  /** Optional name prefix applied to every variable (e.g. `ds` → `$ds-color-primary`). */
  prefix?: string;
}

/**
 * Stable topological reorder of a leaf list whose `$value` may strictly reference
 * another leaf in the same list (`{a.b.c}` form). Each leaf is emitted only after
 * every leaf it references. Among leaves with no remaining unresolved deps, the
 * earliest in the input order wins, so within an independent component the
 * original alphabetical order is preserved.
 *
 * Self-loops and references to leaves that aren't in the input are simply
 * ignored as constraints (the renderer still emits the literal `$ref-name`,
 * which dart-sass will then complain about — that's the caller's bug, not the
 * exporter's responsibility to silently fix).
 */
function topoSortLeaves(leaves: Leaf[]): Leaf[] {
  // Index leaves by their flattened (un-prefixed) path so we can look up
  // referenced targets without re-walking the tree.
  const byKey = new Map<string, number>();
  for (let i = 0; i < leaves.length; i++) {
    byKey.set(leaves[i]!.path.join('.'), i);
  }

  // For each leaf, the set of leaf-indices it depends on (must come before it).
  const deps: Set<number>[] = leaves.map((leaf) => {
    const out = new Set<number>();
    if (typeof leaf.value === 'string') {
      const m = REF_RE.exec(leaf.value);
      if (m) {
        const targetIdx = byKey.get(m[1]!);
        if (targetIdx !== undefined && targetIdx !== leaves.indexOf(leaf)) {
          out.add(targetIdx);
        }
      }
    }
    return out;
  });

  // Reverse adjacency: for each leaf, which leaves depend on it.
  const dependents: number[][] = leaves.map(() => []);
  for (let i = 0; i < leaves.length; i++) {
    for (const d of deps[i]!) dependents[d]!.push(i);
  }

  const remaining = deps.map((s) => s.size);
  const ready: number[] = [];
  for (let i = 0; i < leaves.length; i++) {
    if (remaining[i] === 0) ready.push(i);
  }
  // Insertion order on `ready` is already ascending → ties break by original index.

  const out: Leaf[] = [];
  while (ready.length > 0) {
    // Pop the smallest-index ready node (= earliest in alphabetical input order).
    let minPos = 0;
    for (let i = 1; i < ready.length; i++) {
      if (ready[i]! < ready[minPos]!) minPos = i;
    }
    const idx = ready.splice(minPos, 1)[0]!;
    out.push(leaves[idx]!);
    for (const dep of dependents[idx]!) {
      remaining[dep]!--;
      if (remaining[dep] === 0) ready.push(dep);
    }
  }

  // Cycle fallback: any leaves not yet emitted are in a cycle. Append them in
  // their original order so output stays deterministic; dart-sass will surface
  // the actual circular-reference error if it matters.
  if (out.length < leaves.length) {
    const emitted = new Set(out);
    for (const leaf of leaves) {
      if (!emitted.has(leaf)) out.push(leaf);
    }
  }

  return out;
}

export function toScss(tokens: DTCGTree, opts: ToScssOptions = {}): string {
  const { prefix } = opts;

  const leaves: Leaf[] = [];
  collectLeaves(tokens, [], leaves);

  if (leaves.length === 0) {
    return '';
  }

  const ordered = topoSortLeaves(leaves);

  const lines: string[] = [];
  for (const leaf of ordered) {
    const name = varName(leaf.path, prefix);
    const rhs = renderValue(leaf.value, prefix);
    lines.push(`$${name}: ${rhs};`);
  }
  return lines.join('\n') + '\n';
}

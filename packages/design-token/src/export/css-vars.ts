import type { DTCGTree } from '../schema/dtcg.js';

/**
 * Pure, deterministic exporter: a DTCG token tree → a CSS custom-properties block.
 *
 * Each leaf in the tree (any object with `$value`) becomes one CSS variable on the
 * supplied selector (default `:root`). Nested group names are joined with `-`, so
 * `color.brand.primary` → `--color-brand-primary`. An optional `prefix` is glued
 * with `-` in front of every variable name.
 *
 * DTCG references of the strict form `"{path.to.token}"` (the entire `$value` is a
 * single curly-brace pair around a dot-separated path) are rewritten to
 * `var(--<prefixed-flattened-path>)`. Partial interpolation is not part of the DTCG
 * aliasing spec and is therefore left untouched.
 *
 * Output is byte-stable across runs: keys are sorted alphabetically depth-first at
 * every level, indentation is fixed (2 spaces), the line separator is `\n`, and no
 * trailing whitespace is emitted.
 *
 * Pure — no I/O, no globals, no Date.now(), no Math.random(). Same input + same opts
 * yields character-identical output.
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

/** Join path segments + optional prefix into a CSS variable name (without leading `--`). */
function varName(path: string[], prefix: string | undefined): string {
  const segs = prefix ? [prefix, ...path] : path;
  return segs.join('-');
}

/**
 * Render a single `$value` into the right-hand side of a CSS declaration.
 *  - Strict DTCG ref → `var(--<flattened-prefixed-name>)`.
 *  - String / number / boolean → coerced to string.
 *  - Anything else (array, object) → JSON.stringify so output stays a single line and
 *    deterministic; composite DTCG types (shadow, typography, …) don't have a single
 *    canonical CSS form, so this is the safest stable fallback.
 */
function renderValue(value: unknown, prefix: string | undefined): string {
  if (typeof value === 'string') {
    const m = REF_RE.exec(value);
    if (m) {
      const refPath = m[1]!.split('.');
      return `var(--${varName(refPath, prefix)})`;
    }
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return JSON.stringify(value);
}

export interface ToCssVarsOptions {
  /** Optional name prefix applied to every variable (e.g. `ds` → `--ds-color-primary`). */
  prefix?: string;
  /** CSS selector wrapping the declarations. Defaults to `:root`; passed through verbatim. */
  selector?: string;
}

export function toCssVars(tokens: DTCGTree, opts: ToCssVarsOptions = {}): string {
  const { prefix, selector = ':root' } = opts;

  const leaves: Leaf[] = [];
  collectLeaves(tokens, [], leaves);

  if (leaves.length === 0) {
    return `${selector} {}\n`;
  }

  const lines: string[] = [`${selector} {`];
  for (const leaf of leaves) {
    const name = varName(leaf.path, prefix);
    const rhs = renderValue(leaf.value, prefix);
    lines.push(`  --${name}: ${rhs};`);
  }
  lines.push('}');
  return lines.join('\n') + '\n';
}

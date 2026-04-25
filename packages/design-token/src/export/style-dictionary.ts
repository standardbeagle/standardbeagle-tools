import type { DTCGTree } from '../schema/dtcg.js';

/**
 * Pure, deterministic exporter: a DTCG token tree → a Style Dictionary
 * input object (verified against style-dictionary v5).
 *
 * Style Dictionary's input shape is structurally identical to a DTCG tree
 * except that each leaf carries a single `value` key (not `$value`) and no
 * `$type` / `$description` / `$extensions` metadata. Groups stay groups; the
 * tree shape is preserved.
 *
 * Example:
 *   DTCG  →  { color: { primary: { $value: '#0066cc', $type: 'color' } } }
 *   SD    →  { color: { primary: { value: '#0066cc' } } }
 *
 * DTCG references of the strict form `"{path.to.token}"` are passed through
 * unchanged. Style Dictionary v5 resolves `{path.to.token}` references
 * structurally — it walks to the named node and reads its `value` — so the
 * rewritten DTCG tree is already a valid SD reference graph. (Earlier SD v4
 * required `{path.to.token.value}` because it did a naive deep-key lookup;
 * v5's DTCG-aware resolver removed that requirement, and re-appending
 * `.value` against v5 actively breaks the build with "reference not found".)
 * Partial-string references (e.g. `calc({color.primary} + 1px)`) are not part
 * of the DTCG aliasing spec and are likewise left untouched.
 *
 * Group-level DTCG meta keys (`$type`, `$description`, `$extensions`) are
 * dropped — Style Dictionary doesn't consume them and re-emitting them would
 * just be noise.
 *
 * Output is byte-stable across runs: keys are sorted alphabetically depth-first
 * at every level, so insertion order in the source tree does not affect the
 * resulting object's serialized form.
 *
 * Pure — no I/O, no globals, no Date.now(), no Math.random(). Same input
 * yields a structurally and JSON-textually identical output every time.
 */

/** Reserved DTCG keys that must be skipped when walking groups. */
const RESERVED_KEYS = new Set(['$value', '$type', '$description', '$extensions']);

/**
 * Transform a single `$value` into the Style Dictionary `value`.
 *
 * Style Dictionary v5 accepts DTCG references in their original
 * `{path.to.token}` form, so this is currently the identity transform on
 * scalars/composites alike. Kept as a separate function so reference-
 * rewriting (e.g. for SD v4 back-compat) can be re-introduced without
 * restructuring the walker.
 */
function transformValue(value: unknown): unknown {
  return value;
}

/**
 * Recursively transform a DTCG node into a Style Dictionary node.
 *  - Leaf (has `$value`): emit `{ value: <transformed> }`.
 *  - Group: emit a new object whose own enumerable keys are the alphabetically
 *    sorted child names, with each child recursively transformed. Reserved
 *    DTCG meta keys are stripped.
 *  - Non-object / null / array: returned as-is. The DTCG schema does not
 *    permit these at group/leaf positions, but we mirror what F3/F4/F5 do
 *    (defensive pass-through) so a malformed tree degrades gracefully.
 */
function transformNode(node: unknown): unknown {
  if (typeof node !== 'object' || node === null || Array.isArray(node)) {
    return node;
  }

  const obj = node as Record<string, unknown>;

  if ('$value' in obj) {
    return { value: transformValue(obj.$value) };
  }

  const out: Record<string, unknown> = {};
  const childKeys = Object.keys(obj)
    .filter((k) => !RESERVED_KEYS.has(k))
    .sort();
  for (const key of childKeys) {
    out[key] = transformNode(obj[key]);
  }
  return out;
}

/**
 * Convert a DTCG token tree to a Style Dictionary input object.
 *
 * Returns a plain object suitable for passing to Style Dictionary's
 * `tokens` / `source` field (or for `JSON.stringify` into a tokens.json file
 * fed to the SD CLI). Output is deterministic and contains no DTCG metadata.
 */
export function toStyleDictionary(tokens: DTCGTree): object {
  const result = transformNode(tokens);
  // transformNode on a root group always returns a Record<string, unknown>,
  // never a leaf (root groups don't have $value). Coerce for the public type.
  if (typeof result !== 'object' || result === null || Array.isArray(result)) {
    return {};
  }
  return result;
}

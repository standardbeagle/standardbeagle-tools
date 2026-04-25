import type { DTCGTree } from '../schema/dtcg.js';

/**
 * Pure, deterministic exporter: a DTCG token tree → a Figma Tokens (Tokens
 * Studio for Figma) v1.0 JSON object.
 *
 * Tokens Studio's input shape is structurally similar to DTCG except:
 *   - the entire token tree is wrapped in a top-level `global` set,
 *   - leaves use `{ value, type }` (no `$` prefix) instead of DTCG's
 *     `{ $value, $type }`,
 *   - the `$type` vocabulary is remapped (e.g. DTCG `fontFamily` →
 *     Tokens Studio `fontFamilies`),
 *   - the DTCG `dimension` $type is path-aware: a `dimension` token sitting
 *     anywhere under a `spacing` group is emitted as `type: 'spacing'`;
 *     anywhere else, as `type: 'sizing'` (Tokens Studio has no single
 *     `dimension` slot — sizing and spacing are its two structural buckets).
 *
 * Example:
 *   DTCG  →  { color: { primary: { $value: '#0066cc', $type: 'color' } } }
 *   TS v1 →  { global: { color: { primary: { value: '#0066cc', type: 'color' } } } }
 *
 * DTCG references of the form `"{color.primary}"` pass through unchanged —
 * Tokens Studio uses the same `{path.to.token}` syntax DTCG does, so no
 * rewriting is required.
 *
 * Group-level DTCG meta keys (`$type`, `$description`, `$extensions`) are
 * dropped on emit. Tokens Studio v1 has no equivalent representation for
 * group-level metadata; re-emitting these would produce keys Tokens Studio
 * would treat as malformed child tokens. Leaf-level `$description` and
 * `$extensions` are likewise dropped — Tokens Studio v1's leaf shape is
 * strictly `{ value, type, ...optional Tokens Studio extras }`, and DTCG
 * extras don't have a documented home there.
 *
 * Output is byte-stable across runs: keys are sorted alphabetically depth-first
 * at every level, so insertion order in the source tree does not affect the
 * resulting object's serialized form. The top-level `global` wrapper is the
 * sole exception (single fixed key, no sibling sets emitted by this function).
 *
 * Pure — no I/O, no globals, no Date.now(), no Math.random(). Same input
 * yields a structurally and JSON-textually identical output every time.
 */

/** Reserved DTCG keys that must be skipped when walking groups. */
const RESERVED_KEYS = new Set(['$value', '$type', '$description', '$extensions']);

/**
 * Static DTCG `$type` → Tokens Studio `type` mapping for the 12 types whose
 * remap does not depend on tree position. The 13th type (`dimension`) is
 * path-aware and handled separately in {@link remapType}.
 *
 * Type-mapping rationale (Tokens Studio v1.0 vocabulary, per
 * docs.tokens.studio/design-tokens/types):
 *   color        → color           (identity)
 *   fontFamily   → fontFamilies    (Tokens Studio pluralizes)
 *   fontWeight   → fontWeights     (Tokens Studio pluralizes)
 *   duration     → duration        (identity)
 *   cubicBezier  → cubicBezier     (identity)
 *   number       → number          (identity)
 *   border       → border          (identity)
 *   shadow       → boxShadow       (Tokens Studio CSS-aligned name)
 *   gradient     → color           (Tokens Studio handles gradients under the
 *                                   color category, not as a separate type)
 *   transition   → transition      (Tokens Studio has no first-class slot;
 *                                   leave as-is so a downstream Tokens Studio
 *                                   build can ignore or extend, rather than
 *                                   silently dropping)
 *   strokeStyle  → strokeStyle     (same rationale as transition)
 *   typography   → typography      (identity — Tokens Studio first-class)
 */
const STATIC_TYPE_REMAP: Record<string, string> = {
  color: 'color',
  fontFamily: 'fontFamilies',
  fontWeight: 'fontWeights',
  duration: 'duration',
  cubicBezier: 'cubicBezier',
  number: 'number',
  border: 'border',
  shadow: 'boxShadow',
  gradient: 'color',
  transition: 'transition',
  strokeStyle: 'strokeStyle',
  typography: 'typography',
};

/**
 * Remap a DTCG `$type` to its Tokens Studio `type`, using the leaf's ancestor
 * key path to resolve the path-aware `dimension` case.
 *
 * `path` is the chain of group keys from the tree root down to (but not
 * including) the leaf itself. A `dimension` leaf is emitted as `'spacing'`
 * iff any segment of the path is exactly `'spacing'`; otherwise it falls
 * back to `'sizing'`.
 *
 * Unknown $types pass through unchanged — defensive, in case a tree carries
 * a type the spec adds in a future revision. The DTCG validator (separate
 * concern) is the right place to reject those, not this exporter.
 */
function remapType(dtcgType: string, path: readonly string[]): string {
  if (dtcgType === 'dimension') {
    return path.includes('spacing') ? 'spacing' : 'sizing';
  }
  const remapped = STATIC_TYPE_REMAP[dtcgType];
  return remapped !== undefined ? remapped : dtcgType;
}

/**
 * Recursively transform a DTCG node into a Tokens Studio node.
 *
 *  - Leaf (has `$value`): emit `{ value: <$value>, type: <remapped $type> }`.
 *    The leaf's effective `$type` is its own `$type` if present, else the
 *    nearest ancestor group's `$type` (DTCG inheritance). A leaf with no
 *    resolvable `$type` emits no `type` key — Tokens Studio will treat it as
 *    untyped, which matches the DTCG semantics.
 *  - Group: emit a new object whose own enumerable keys are the alphabetically
 *    sorted child names, with each child recursively transformed. Reserved
 *    DTCG meta keys are stripped.
 *  - Non-object / null / array: returned as-is. The DTCG schema does not
 *    permit these at group/leaf positions, but we mirror the F3/F4/F5/F6
 *    convention (defensive pass-through) so a malformed tree degrades
 *    gracefully rather than throwing.
 *
 * `path` is the chain of group keys from the root down to (but not
 * including) the current node — needed for path-aware `dimension` remapping.
 * `inheritedType` is the closest ancestor group's `$type`, propagated for
 * DTCG type inheritance.
 */
function transformNode(
  node: unknown,
  path: readonly string[],
  inheritedType: string | undefined,
): unknown {
  if (typeof node !== 'object' || node === null || Array.isArray(node)) {
    return node;
  }

  const obj = node as Record<string, unknown>;

  // Leaf: emit { value, type }.
  if ('$value' in obj) {
    const leafType =
      typeof obj.$type === 'string' ? (obj.$type as string) : inheritedType;
    const out: Record<string, unknown> = { value: obj.$value };
    if (leafType !== undefined) {
      out.type = remapType(leafType, path);
    }
    return out;
  }

  // Group: recurse on every non-reserved child, sorted for determinism.
  const groupType =
    typeof obj.$type === 'string' ? (obj.$type as string) : inheritedType;
  const result: Record<string, unknown> = {};
  const childKeys = Object.keys(obj)
    .filter((k) => !RESERVED_KEYS.has(k))
    .sort();
  for (const key of childKeys) {
    result[key] = transformNode(obj[key], [...path, key], groupType);
  }
  return result;
}

/**
 * Convert a DTCG token tree to a Tokens Studio for Figma v1.0 JSON object.
 *
 * The whole transformed tree is wrapped in a single top-level `global` set —
 * the default and most universally-supported Tokens Studio set name. Callers
 * that need multiple sets (light/dark, brand variants) compose them after
 * the fact by merging multiple `toFigmaTokens` outputs under different set
 * keys.
 *
 * Returns a plain object suitable for `JSON.stringify` into a tokens.json
 * file consumed by the Tokens Studio for Figma plugin's "Load from JSON"
 * feature.
 */
export function toFigmaTokens(tokens: DTCGTree): object {
  const transformed = transformNode(tokens, [], undefined);
  // transformNode on a root group always returns a Record<string, unknown>
  // (root groups don't have $value). Coerce defensively for the public type.
  const inner =
    typeof transformed === 'object' &&
    transformed !== null &&
    !Array.isArray(transformed)
      ? (transformed as Record<string, unknown>)
      : {};
  return { global: inner };
}

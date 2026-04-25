import type { DTCGTree } from '../schema/dtcg.js';

/**
 * Pure, deterministic exporter: a DTCG token tree → a Tailwind CSS `theme`
 * configuration object (the literal JS object you'd splat into
 * `tailwind.config.{js,ts}` under `theme.extend`).
 *
 * Unlike the CSS-vars and SCSS exporters, this one returns a structured object
 * rather than a string — Tailwind consumes JS, not CSS source.
 *
 * DTCG → Tailwind slot mapping (only these six top-level groups are read; every
 * other group is silently dropped, since Tailwind has no semantic home for it
 * in `theme.extend` without project-specific opinions):
 *
 *   color.*        →  colors
 *   font.size.*    →  fontSize
 *   font.family.*  →  fontFamily
 *   font.weight.*  →  fontWeight
 *   spacing.*      →  spacing
 *   shadow.*       →  boxShadow
 *
 * Nested groups under each slot become nested objects, so
 * `color.gray.100` → `colors.gray["100"]`. Numeric-leaf keys are preserved as
 * string keys; Tailwind treats `colors.gray[100]` and `colors.gray["100"]`
 * identically at runtime.
 *
 * Per-leaf $type filtering: each slot has an expected DTCG $type, and a leaf
 * whose own $type disagrees is skipped (e.g. a `color`-typed leaf accidentally
 * placed under `font.size.*` is dropped). Group-level $type is treated as an
 * inheritable default. Leaves with no resolved $type are accepted into the
 * slot they sit under (lenient — matches DTCG's own type-inheritance rules).
 *
 * Reserved DTCG keys (`$value`, `$type`, `$description`, `$extensions`) are
 * skipped during the walk.
 *
 * Reference values (`"{path.to.token}"`) are returned AS-IS — Tailwind has no
 * native understanding of DTCG aliases, and the F9 orchestrator (future) is
 * expected to resolve refs before reaching this function. Documenting that
 * expectation here so the contract is explicit.
 *
 * Composite shadow $value: DTCG defines `shadow` as an object with
 * `{color, offsetX, offsetY, blur, spread, inset?}`. Tailwind's `boxShadow`
 * expects a single CSS shadow string per key, so we serialize composites to
 * `<offsetX> <offsetY> <blur> <spread> <color>` (with `inset` prefix when
 * truthy). Already-string $values pass through unchanged. Arrays of shadows
 * (DTCG-legal layered shadow) join with `, `.
 *
 * fontFamily $value may be a single string OR an array of fallback strings;
 * Tailwind likewise accepts both. We pass through whichever shape DTCG gave.
 *
 * Empty slots are omitted from the output entirely (no `boxShadow: {}` keys).
 *
 * Pure — no I/O, no globals, no Date.now(), no Math.random(). Same input
 * yields a structurally-identical (and JSON.stringify byte-identical) result.
 */

/** Reserved DTCG keys that must never appear as Tailwind keys. */
const RESERVED_KEYS = new Set(['$value', '$type', '$description', '$extensions']);

/**
 * Tailwind theme slots populated by this exporter. We deliberately expose only
 * the six categories the DTCG → Tailwind mapping covers; callers who need
 * other Tailwind slots compose them after the fact.
 */
export interface TailwindThemeConfig {
  colors?: Record<string, unknown>;
  fontSize?: Record<string, unknown>;
  fontFamily?: Record<string, unknown>;
  fontWeight?: Record<string, unknown>;
  spacing?: Record<string, unknown>;
  boxShadow?: Record<string, unknown>;
}

/** Slot descriptor: where to look in the DTCG tree, where to write in Tailwind, expected $type. */
interface SlotMap {
  /** Path into the DTCG tree to use as the slot root (e.g. ['color'], ['font', 'size']). */
  source: string[];
  /** Key on the TailwindThemeConfig object the slot writes to. */
  target: keyof TailwindThemeConfig;
  /** Expected DTCG $type for leaves in this slot; mismatched leaves are dropped. */
  expectedType: string;
}

const SLOTS: readonly SlotMap[] = [
  { source: ['color'], target: 'colors', expectedType: 'color' },
  { source: ['font', 'size'], target: 'fontSize', expectedType: 'dimension' },
  { source: ['font', 'family'], target: 'fontFamily', expectedType: 'fontFamily' },
  { source: ['font', 'weight'], target: 'fontWeight', expectedType: 'fontWeight' },
  { source: ['spacing'], target: 'spacing', expectedType: 'dimension' },
  { source: ['shadow'], target: 'boxShadow', expectedType: 'shadow' },
];

/** Look up a sub-tree by path; returns undefined if any segment is missing or not a plain object. */
function getAtPath(tree: unknown, path: string[]): unknown {
  let cur: unknown = tree;
  for (const seg of path) {
    if (typeof cur !== 'object' || cur === null || Array.isArray(cur)) return undefined;
    cur = (cur as Record<string, unknown>)[seg];
  }
  return cur;
}

/**
 * A leaf result is `{ kind: 'leaf', value }`; a group result is
 * `{ kind: 'group', value: Record<string, unknown> }`. Discriminating by
 * `kind` (rather than by introspecting the rendered value) lets leaf renderers
 * legitimately return objects/arrays — e.g. fontFamily arrays — without
 * confusing them for nested groups.
 */
type SlotResult =
  | { kind: 'leaf'; value: unknown }
  | { kind: 'group'; value: Record<string, unknown> };

/**
 * Walk a slot's sub-tree, building the nested Tailwind object. The inherited
 * `$type` propagates down from groups to leaves — a leaf without its own
 * `$type` adopts the closest ancestor's `$type`. Leaves whose effective
 * `$type` does not match `expectedType` are dropped silently.
 *
 * Keys are sorted alphabetically at every level so the resulting object's
 * key-iteration order — and therefore JSON.stringify output — is fully
 * determined by the input shape, independent of how the input was constructed.
 */
function buildSlot(
  node: unknown,
  inheritedType: string | undefined,
  expectedType: string,
  renderLeaf: (value: unknown) => unknown,
): SlotResult | undefined {
  if (typeof node !== 'object' || node === null || Array.isArray(node)) return undefined;
  const obj = node as Record<string, unknown>;

  // Resolve $type at this level; group-level $type inherits to descendants.
  const groupType =
    typeof obj.$type === 'string' ? (obj.$type as string) : inheritedType;

  // Leaf: emit a single value if its effective $type matches the slot.
  if ('$value' in obj) {
    const leafType =
      typeof obj.$type === 'string' ? (obj.$type as string) : inheritedType;
    if (leafType !== undefined && leafType !== expectedType) return undefined;
    // No leafType resolved → accept (lenient; matches DTCG inheritance rules).
    return { kind: 'leaf', value: renderLeaf(obj.$value) };
  }

  // Group: recurse on every non-reserved child, sorted for determinism.
  const out: Record<string, unknown> = {};
  const childKeys = Object.keys(obj)
    .filter((k) => !RESERVED_KEYS.has(k))
    .sort();
  for (const key of childKeys) {
    const child = buildSlot(obj[key], groupType, expectedType, renderLeaf);
    if (child === undefined) continue;
    if (child.kind === 'leaf') {
      out[key] = child.value;
    } else if (Object.keys(child.value).length > 0) {
      out[key] = child.value;
    }
  }
  return Object.keys(out).length > 0 ? { kind: 'group', value: out } : undefined;
}

/**
 * Serialize a DTCG composite shadow object into a single CSS box-shadow string.
 * Layered shadow arrays join with `, `.
 *
 *   { color, offsetX, offsetY, blur, spread, inset? }
 *     → "[inset ]<offsetX> <offsetY> <blur> <spread> <color>"
 *
 * String $values pass through unchanged (legacy / pre-composite tokens).
 */
function renderShadow(value: unknown): unknown {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.map((v) => renderShadow(v)).join(', ');
  }
  if (typeof value === 'object' && value !== null) {
    const s = value as {
      color?: unknown;
      offsetX?: unknown;
      offsetY?: unknown;
      blur?: unknown;
      spread?: unknown;
      inset?: unknown;
    };
    const parts = [s.offsetX, s.offsetY, s.blur, s.spread, s.color]
      .filter((p) => p !== undefined)
      .map((p) => String(p));
    const body = parts.join(' ');
    return s.inset ? `inset ${body}` : body;
  }
  return String(value);
}

/** Identity renderer for slots that pass values through verbatim (color, dimension, fontFamily, fontWeight). */
function renderIdentity(value: unknown): unknown {
  return value;
}

export function toTailwindTheme(tokens: DTCGTree): TailwindThemeConfig {
  const out: TailwindThemeConfig = {};

  for (const slot of SLOTS) {
    const subtree = getAtPath(tokens, slot.source);
    if (subtree === undefined) continue;

    // Resolve initial inherited $type by walking the path and picking up any
    // group-level $type along the way. This lets `color: { $type: 'color', ... }`
    // declare the slot's type once at the root.
    let inherited: string | undefined;
    let cursor: unknown = tokens;
    for (const seg of slot.source) {
      if (typeof cursor !== 'object' || cursor === null || Array.isArray(cursor)) break;
      const c = cursor as Record<string, unknown>;
      if (typeof c.$type === 'string') inherited = c.$type;
      cursor = c[seg];
    }
    if (typeof cursor === 'object' && cursor !== null && !Array.isArray(cursor)) {
      const c = cursor as Record<string, unknown>;
      if (typeof c.$type === 'string') inherited = c.$type;
    }

    const renderer = slot.target === 'boxShadow' ? renderShadow : renderIdentity;
    const built = buildSlot(subtree, inherited, slot.expectedType, renderer);
    // Only group-shaped results are usable as a Tailwind theme slot
    // (e.g. `colors: { primary: '#fff' }`). A bare-leaf at a slot root has
    // no Tailwind key name to bind to, so it's dropped.
    if (built !== undefined && built.kind === 'group' && Object.keys(built.value).length > 0) {
      out[slot.target] = built.value;
    }
  }

  return out;
}

import { DtcgNode, isLeafNode, isObjectNode } from '../schema/dtcg.js';

/**
 * A flattened DTCG tree: dotted-path → leaf object (the full object, including
 * `$value`, `$type`, and any other reserved/extension keys).
 *
 * The map preserves insertion order in walk-traversal order (parent before children,
 * children in source-key order). Callers that need a deterministic emission order
 * should sort by key explicitly — order in this map is "natural traversal", not "sorted".
 */
export type FlatLeafMap = Map<string, DtcgNode>;

/**
 * Flatten a DTCG tree to a `Map<dotted-path, leafObject>`.
 *
 * - Recursively walks the input.
 * - A node is a leaf iff it has `$value` (consistent with `isLeafNode`).
 * - Reserved keys ($value/$type/$description/$extensions) on group nodes are *not*
 *   recursed into — they are metadata, not children. This matches `tokens_validate`
 *   semantics where `$type` on a group means inheritable default, not a child token.
 * - Non-object nodes (string, number, etc.) are silently ignored at non-root paths;
 *   these would have been flagged as INVALID_NODE by `tokens_validate`. Diff/merge
 *   are intentionally permissive — they describe what's *there*, not what's well-formed.
 * - The root tree itself is treated as a group; if the root happens to look like a
 *   leaf (has `$value`), it is recorded under the empty path `""`.
 */
export function flattenDtcg(tree: DtcgNode): FlatLeafMap {
  const out: FlatLeafMap = new Map();
  walk(tree, '', out);
  return out;
}

function walk(node: unknown, path: string, out: FlatLeafMap): void {
  if (!isObjectNode(node)) return;

  if (isLeafNode(node)) {
    out.set(path, node);
    return;
  }

  // Group: recurse into non-reserved children only.
  for (const key of Object.keys(node)) {
    if (key.startsWith('$')) continue;
    const childPath = path === '' ? key : `${path}.${key}`;
    walk((node as DtcgNode)[key], childPath, out);
  }
}

/**
 * Set a value at a dotted path inside a tree, creating intermediate group objects
 * as needed. Used by `tokens_merge` to project flat overrides back into a nested tree.
 *
 * Important: when an intermediate path collides with an existing leaf (a node that
 * already has `$value`), this throws — that is a structural conflict (group-vs-leaf)
 * which the caller must surface as an error, not silently overwrite.
 */
export function setAtPath(tree: DtcgNode, path: string, leaf: DtcgNode): void {
  if (path === '') {
    // Root-as-leaf: copy the leaf's own keys onto the tree.
    for (const k of Object.keys(leaf)) {
      (tree as Record<string, unknown>)[k] = leaf[k];
    }
    return;
  }
  const parts = path.split('.');
  let cursor: DtcgNode = tree;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]!;
    const next = (cursor as Record<string, unknown>)[key];
    if (next === undefined) {
      const child: DtcgNode = {};
      (cursor as Record<string, unknown>)[key] = child;
      cursor = child;
      continue;
    }
    if (!isObjectNode(next)) {
      throw new Error(`setAtPath: non-object at "${parts.slice(0, i + 1).join('.')}"`);
    }
    if (isLeafNode(next)) {
      throw new Error(
        `setAtPath: structural conflict at "${parts.slice(0, i + 1).join('.')}" — existing leaf cannot become a group`,
      );
    }
    cursor = next;
  }
  const lastKey = parts[parts.length - 1]!;
  const existing = (cursor as Record<string, unknown>)[lastKey];
  if (isObjectNode(existing) && !isLeafNode(existing) && Object.keys(existing).some((k) => !k.startsWith('$'))) {
    // Existing non-empty group at the leaf slot.
    throw new Error(
      `setAtPath: structural conflict at "${path}" — existing group cannot become a leaf`,
    );
  }
  (cursor as Record<string, unknown>)[lastKey] = leaf;
}

/**
 * Deep-equality check for `$value` comparison. Intentionally narrow:
 *   - same primitive (===) → equal;
 *   - both arrays of same length with deep-equal elements → equal;
 *   - both plain objects with same key set and deep-equal values → equal;
 *   - otherwise not equal.
 *
 * Matches the structural shape of every DTCG `$value`: numbers, strings, booleans,
 * arrays of those, and plain objects of those. Functions/symbols/Map/Set never appear
 * in DTCG trees, so we don't need to handle them.
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const ak = Object.keys(a as object);
    const bk = Object.keys(b as object);
    if (ak.length !== bk.length) return false;
    for (const k of ak) {
      if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
      if (!deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) return false;
    }
    return true;
  }
  return false;
}

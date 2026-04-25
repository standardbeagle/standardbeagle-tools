import { deepEqual, flattenDtcg } from '../lib/dtcg-walk.js';
import type { TokensDiffInput, TokensDiffOutput } from './tokens-diff.schema.js';

/**
 * Diff two DTCG trees at the leaf level.
 *
 * Algorithm:
 *  1. Flatten both inputs to `Map<dotted-path, leafObject>`.
 *  2. For each path in either map:
 *       - in `b` only          → added   (with `value` = full leaf from `b`)
 *       - in `a` only          → removed (with `value` = full leaf from `a`)
 *       - in both, $value diff → changed (with `old`/`new` = full leaves)
 *       - in both, $value eq   → no entry (description-only edits suppressed)
 *  3. Sort all three output arrays by `path` ascending — output is byte-stable
 *     for any two inputs that flatten to the same key set.
 *
 * Comparison policy: `$value` is compared with structural deep-equality
 * (`deepEqual` from `lib/dtcg-walk.ts`). `$description` and `$extensions` are
 * ignored for the changed-vs-equal decision. `$type` is *not* explicitly checked
 * separately — a $type change with the same $value is silently equal here, which
 * matches the documented contract ("describe value-level edits").
 */
export function tokensDiff(input: TokensDiffInput): TokensDiffOutput {
  const flatA = flattenDtcg(input.a);
  const flatB = flattenDtcg(input.b);

  const added: Array<{ path: string; value: unknown }> = [];
  const removed: Array<{ path: string; value: unknown }> = [];
  const changed: Array<{ path: string; old: unknown; new: unknown }> = [];

  // removed + changed: walk A's keys.
  for (const [path, leafA] of flatA) {
    const leafB = flatB.get(path);
    if (leafB === undefined) {
      removed.push({ path, value: leafA });
      continue;
    }
    if (!deepEqual(leafA.$value, leafB.$value)) {
      changed.push({ path, old: leafA, new: leafB });
    }
  }

  // added: paths only in B.
  for (const [path, leafB] of flatB) {
    if (!flatA.has(path)) {
      added.push({ path, value: leafB });
    }
  }

  added.sort(byPath);
  removed.sort(byPath);
  changed.sort(byPath);

  return { added, removed, changed };
}

function byPath<T extends { path: string }>(x: T, y: T): number {
  if (x.path < y.path) return -1;
  if (x.path > y.path) return 1;
  return 0;
}

import { DtcgNode } from '../schema/dtcg.js';
import { flattenDtcg, setAtPath } from '../lib/dtcg-walk.js';
import type {
  TokensMergeConflict,
  TokensMergeInput,
  TokensMergeOutput,
} from './tokens-merge.schema.js';

/**
 * Merge a base DTCG tree with an ordered list of overrides.
 *
 * Algorithm:
 *  1. Flatten base + each override into `(source_index, path → leaf)` pairs.
 *     Source index -1 = base; 0..N-1 = overrides[i].
 *  2. For each path in the union of all flat maps, collect every (source_index, leaf)
 *     that contributed a leaf at that path. Order in `sources[]` follows source_index
 *     ascending: base first, then overrides in array order.
 *  3. Detect structural (group-vs-leaf) conflicts: any path P that is a strict prefix
 *     of another path P.x in the union means *some* source treats P as a group while
 *     *some* source treats P as a leaf. This is *always* an error regardless of
 *     `conflict_resolution`, because there is no value-level choice to make.
 *  4. For each path with >1 contributing source, push a Conflict entry — *always*,
 *     even when the resolution mode is silent. The caller can then audit which paths
 *     were contested.
 *  5. Apply `conflict_resolution`:
 *       'last-wins'  → take leaf from highest source_index in `sources`;
 *       'first-wins' → take leaf from lowest source_index in `sources`
 *                      (i.e. base if base contributed, else earliest override);
 *       'error'      → throw with the first conflict's `{ path, sources }` payload.
 *  6. Project all winning leaves into a fresh tree using `setAtPath`.
 *  7. Sort the `conflicts` array by path for deterministic output.
 *
 * Determinism: same inputs → same merged tree key order (driven by walk order over
 * sources base→0→1→…→N-1, then per-source by source key order) and same conflicts
 * array (sorted). JSON.stringify of the result is byte-stable.
 */
export function tokensMerge(input: TokensMergeInput): TokensMergeOutput {
  const { base, overrides, conflict_resolution } = input;

  // Step 1: flatten every source. baseMap uses index -1; overrides use 0..N-1.
  const sources: Array<{ index: number; flat: Map<string, DtcgNode> }> = [];
  sources.push({ index: -1, flat: flattenDtcg(base) });
  for (let i = 0; i < overrides.length; i++) {
    sources.push({ index: i, flat: flattenDtcg(overrides[i]!) });
  }

  // Step 2: build path → ordered list of contributing sources.
  // We iterate sources in ascending index order so the resulting `sources[]` array
  // for each path is also in ascending order — predictable for the caller.
  const contributions = new Map<string, Array<{ source_index: number; value: DtcgNode }>>();
  for (const { index, flat } of sources) {
    for (const [path, leaf] of flat) {
      let list = contributions.get(path);
      if (!list) {
        list = [];
        contributions.set(path, list);
      }
      list.push({ source_index: index, value: leaf });
    }
  }

  // Step 3: structural-conflict detection. Sort all paths; for each consecutive pair,
  // if one is a strict prefix of the next (with a "." boundary), flag.
  const allPaths = [...contributions.keys()].sort();
  for (let i = 0; i < allPaths.length; i++) {
    const p = allPaths[i]!;
    for (let j = i + 1; j < allPaths.length; j++) {
      const q = allPaths[j]!;
      if (!q.startsWith(p)) break; // sorted; no further q can have p as prefix.
      if (q.length === p.length) continue; // duplicate (impossible in a Map but safe)
      // Boundary check: "color" is NOT a path-prefix of "colors.brand" — only of "color.brand".
      // The empty path "" is the degenerate root-as-leaf case; any non-empty q is then a child.
      if (p.length > 0 && q[p.length] !== '.') continue;
      // p is a strict path-prefix of q → group-vs-leaf collision.
      const sourcesAtP = contributions.get(p)!;
      const sourcesAtQ = contributions.get(q)!;
      throw new Error(
        `tokens_merge: structural conflict — "${p}" is a leaf in source(s) ${sourcesAtP
          .map((s) => s.source_index)
          .join(',')} but a group in source(s) containing "${q}" (${sourcesAtQ
          .map((s) => s.source_index)
          .join(',')})`,
      );
    }
  }

  // Step 4 & 5: resolve each path; collect all multi-source paths into conflicts[].
  const conflicts: TokensMergeConflict[] = [];
  const winners = new Map<string, DtcgNode>();

  for (const [path, list] of contributions) {
    if (list.length > 1) {
      conflicts.push({
        path,
        sources: list.map((s) => ({ source_index: s.source_index, value: s.value })),
      });
      if (conflict_resolution === 'error') {
        // Throw with a JSON-encoded conflict payload so the caller can parse it.
        const payload = { path, sources: list };
        const err = new Error(`tokens_merge: conflict at "${path}" (mode=error)`);
        (err as Error & { conflict?: unknown }).conflict = payload;
        throw err;
      }
    }
    // Pick the winner.
    let winner: DtcgNode;
    if (conflict_resolution === 'first-wins') {
      // lowest source_index wins (base preferred, then earliest override).
      winner = list[0]!.value;
    } else {
      // last-wins (default) — highest index wins.
      winner = list[list.length - 1]!.value;
    }
    winners.set(path, winner);
  }

  // Step 6: project winners into a fresh tree.
  const merged: DtcgNode = {};
  // Insert in path-sort order so the tree is built parent-first; setAtPath creates
  // intermediate groups as needed, but a sorted projection keeps key insertion order
  // stable across runs with the same inputs.
  const sortedWinnerPaths = [...winners.keys()].sort();
  for (const path of sortedWinnerPaths) {
    setAtPath(merged, path, winners.get(path)!);
  }

  // Step 7: sort conflicts.
  conflicts.sort((x, y) => (x.path < y.path ? -1 : x.path > y.path ? 1 : 0));

  return { merged, conflicts };
}

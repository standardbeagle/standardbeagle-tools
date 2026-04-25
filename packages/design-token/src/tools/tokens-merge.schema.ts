import { z } from 'zod';

/**
 * tokens_merge input.
 *
 * - `base`: the starting tree.
 * - `overrides`: ordered list of trees applied left-to-right on top of `base`.
 *   For `last-wins`, the rightmost source for any given path wins; for `first-wins`,
 *   the *earliest* non-base source for that path wins.
 * - `conflict_resolution`:
 *     'last-wins'  (default) → take the latest-source leaf;
 *     'first-wins'           → keep the earliest non-base leaf (or base, if no overrides set the path);
 *     'error'                → throw on the first leaf-vs-leaf conflict.
 *
 * Group-vs-leaf collisions (one source has a group at path P, another has a leaf at the
 * same P) are *always* an error — that is a structural conflict, never a value choice.
 */
export const TokensMergeInputSchema = z.object({
  base: z.record(z.string(), z.any()),
  overrides: z.array(z.record(z.string(), z.any())).default([]),
  conflict_resolution: z.enum(['last-wins', 'first-wins', 'error']).default('last-wins'),
});

const ConflictSourceSchema = z.object({
  /** -1 = base, 0..N-1 = overrides[i]. */
  source_index: z.number().int(),
  /** The full leaf object from that source. */
  value: z.any(),
});

const ConflictSchema = z.object({
  path: z.string(),
  sources: z.array(ConflictSourceSchema),
});

/**
 * Output:
 *   - merged:    the resolved tree.
 *   - conflicts: every path where >1 source supplied a leaf, regardless of resolution
 *                outcome. Sorted by path. Allows the caller to audit which paths were
 *                contested even if `last-wins` silently picked one.
 */
export const TokensMergeOutputSchema = z.object({
  merged: z.record(z.string(), z.any()),
  conflicts: z.array(ConflictSchema),
});

export type TokensMergeInput = z.infer<typeof TokensMergeInputSchema>;
export type TokensMergeOutput = z.infer<typeof TokensMergeOutputSchema>;
export type TokensMergeConflict = z.infer<typeof ConflictSchema>;

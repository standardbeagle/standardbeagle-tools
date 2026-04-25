import { z } from 'zod';

/**
 * tokens_diff input: two DTCG trees to compare. Both are recursive object records;
 * structural well-formedness is *not* enforced here — diff is permissive (it describes
 * what's there). Run `tokens_validate` separately to gate input quality.
 */
export const TokensDiffInputSchema = z.object({
  a: z.record(z.string(), z.any()),
  b: z.record(z.string(), z.any()),
});

const AddedEntrySchema = z.object({ path: z.string(), value: z.any() });
const RemovedEntrySchema = z.object({ path: z.string(), value: z.any() });
const ChangedEntrySchema = z.object({
  path: z.string(),
  old: z.any(),
  new: z.any(),
});

/**
 * Output: three sorted-by-path arrays.
 *  - added:   leaves present in `b` but not in `a` (new tokens).
 *  - removed: leaves present in `a` but not in `b` (deleted tokens).
 *  - changed: leaves in both with different `$value` (semantic edits).
 *
 * `$description` is intentionally ignored: a description-only edit is not a token
 * change. `$type` shifts on the same path *do* show up as `changed` because the
 * leaf object itself differs (we report old/new full leaf, not just $value).
 */
export const TokensDiffOutputSchema = z.object({
  added: z.array(AddedEntrySchema),
  removed: z.array(RemovedEntrySchema),
  changed: z.array(ChangedEntrySchema),
});

export type TokensDiffInput = z.infer<typeof TokensDiffInputSchema>;
export type TokensDiffOutput = z.infer<typeof TokensDiffOutputSchema>;

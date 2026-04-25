import { z } from 'zod';

/**
 * tokens_generate input schema.
 *
 * - palette: a flat record of {name → CSS color string}. Each entry produces a color leaf
 *   under `color.<name>` with $type: "color".
 * - type_scale: modular type scale parameters; emits `font.size.{caption,small,body,h6..h1}`
 *   as dimension leaves. Default base 16, ratio 1.25 (major third).
 * - spacing: linear spacing scale; emits `spacing.0..spacing.<steps>` as dimension leaves
 *   in px. Default base 4, steps 10 → 11 entries (0..10 inclusive).
 */
export const TokensGenerateInputSchema = z.object({
  palette: z.record(z.string(), z.string()).default({}),
  type_scale: z
    .object({
      base: z.number().default(16),
      ratio: z.number().default(1.25),
    })
    .default({ base: 16, ratio: 1.25 }),
  spacing: z
    .object({
      base: z.number().default(4),
      steps: z.number().default(10),
    })
    .default({ base: 4, steps: 10 }),
});

/**
 * tokens_generate output schema: a DTCG-format JSON tree. Validated structurally as a
 * recursive object record; the per-token $value/$type validity gate is the F1 tokens_validate
 * tool, which the test suite uses as proof-of-conformance.
 */
export const TokensGenerateOutputSchema = z.record(z.string(), z.any());

export type TokensGenerateInput = z.infer<typeof TokensGenerateInputSchema>;
export type TokensGenerateOutput = z.infer<typeof TokensGenerateOutputSchema>;

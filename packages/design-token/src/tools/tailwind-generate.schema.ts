import { z } from 'zod';

/**
 * tailwind_generate input.
 *
 * High-level orchestrator that composes F2 (tokens_generate) and F5 (toTailwindTheme)
 * into a single one-shot "give me a Tailwind theme config from primitives" tool.
 *
 *  - palette: flat record of {name → CSS color string} forwarded verbatim to F2.
 *  - type_scale: {base, ratio} forwarded verbatim to F2.
 *  - spacing: {base, steps} forwarded verbatim to F2.
 *  - semantic_map: optional alias map {<semantic-name>: <palette-key>}, e.g.
 *      {success: 'green', danger: 'primary'}
 *    Resolved against the palette and injected into the Tailwind `colors` slot at
 *    Tailwind output time. Each alias gets the *resolved hex value* of its palette
 *    target — references are not a Tailwind concept, so we resolve eagerly.
 *    Unknown alias targets throw (fail-fast).
 *  - output_format:
 *      'object'    → return raw config object only (default)
 *      'js-module' → also emit CommonJS module source string
 *      'ts-module' → also emit ESM TypeScript source string with `satisfies Config`
 */
export const TailwindGenerateInputSchema = z.object({
  palette: z.record(z.string(), z.string()),
  type_scale: z.object({
    base: z.number(),
    ratio: z.number(),
  }),
  spacing: z.object({
    base: z.number(),
    steps: z.number(),
  }),
  semantic_map: z.record(z.string(), z.string()).optional(),
  output_format: z.enum(['object', 'js-module', 'ts-module']).default('object'),
});

/**
 * Output:
 *  - config: the raw Tailwind theme-extend object (always present).
 *  - code:   the wrapped module source string. Only present when
 *            output_format ∈ {'js-module', 'ts-module'}; absent for 'object'.
 */
export const TailwindGenerateOutputSchema = z.object({
  config: z.any(),
  code: z.string().optional(),
});

export type TailwindGenerateInput = z.infer<typeof TailwindGenerateInputSchema>;
export type TailwindGenerateOutput = z.infer<typeof TailwindGenerateOutputSchema>;

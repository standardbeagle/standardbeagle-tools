import { z } from 'zod';

export const ContrastCheckInputSchema = z.object({
  foreground: z.string(),
  background: z.string(),
  target: z.enum(['AA', 'AAA']).default('AA'),
  text_size: z.enum(['normal', 'large']).default('normal'),
});

export const ContrastCheckOutputSchema = z.object({
  ratio: z.number(),
  passes: z.boolean(),
  target_threshold: z.number(),
  suggestions: z
    .array(
      z.object({
        adjust: z.enum(['foreground', 'background']),
        new_hex: z.string(),
        new_ratio: z.number(),
      }),
    )
    .optional(),
});

export type ContrastCheckInput = z.infer<typeof ContrastCheckInputSchema>;
export type ContrastCheckOutput = z.infer<typeof ContrastCheckOutputSchema>;

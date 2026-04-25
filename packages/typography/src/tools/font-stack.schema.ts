import { z } from 'zod';

export const FontStackInputSchema = z.object({
  custom_font_path: z.string(),
  family_type: z.enum(['sans-serif', 'serif', 'monospace']).default('sans-serif'),
});

export const FontStackOutputSchema = z.object({
  stack: z.array(z.string()),
  at_font_face: z.string(),
  css_usage: z.string(),
});

export type FontStackInput = z.infer<typeof FontStackInputSchema>;
export type FontStackOutput = z.infer<typeof FontStackOutputSchema>;

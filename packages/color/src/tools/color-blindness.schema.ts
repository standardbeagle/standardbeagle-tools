import { z } from 'zod';

export const ColorBlindnessInputSchema = z.object({
  colors: z.union([z.string(), z.array(z.string())]),
  type: z.enum(['deuteranopia', 'protanopia', 'tritanopia', 'all']).default('all'),
  severity: z.number().min(0).max(1).default(1.0),
});

export const ColorBlindnessOutputSchema = z.object({
  results: z.array(
    z.object({
      original: z.string(),
      deuteranopia: z.string().optional(),
      protanopia: z.string().optional(),
      tritanopia: z.string().optional(),
    }),
  ),
});

export type ColorBlindnessInput = z.infer<typeof ColorBlindnessInputSchema>;
export type ColorBlindnessOutput = z.infer<typeof ColorBlindnessOutputSchema>;

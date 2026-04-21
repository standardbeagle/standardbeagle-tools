import { z } from 'zod';

export const HarmonyGenerateInputSchema = z.object({
  base: z.string(),
  scheme: z.enum(['complementary', 'triadic', 'analogous', 'split-complementary', 'tetradic', 'monochromatic']),
  count: z.number().int().optional(),
});

export const HarmonyGenerateOutputSchema = z.object({
  base: z.string(),
  scheme: z.string(),
  palette: z.array(z.string()),
});

export type HarmonyGenerateInput = z.infer<typeof HarmonyGenerateInputSchema>;
export type HarmonyGenerateOutput = z.infer<typeof HarmonyGenerateOutputSchema>;

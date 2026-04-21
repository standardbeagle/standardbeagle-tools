import { z } from 'zod';

export const FontPairInputSchema = z.object({
  primary: z.string(),
  mood: z.enum(['modern', 'classic', 'playful', 'serious', 'minimal']).optional(),
  category: z.enum(['serif', 'sans-serif', 'display', 'monospace']).optional(),
});

export const FontPairOutputSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  fallback: z.string(),
});

export type FontPairInput = z.infer<typeof FontPairInputSchema>;
export type FontPairOutput = z.infer<typeof FontPairOutputSchema>;

import { z } from 'zod';

export const ImageOptimizeInputSchema = z.object({
  input: z.string(),
  output: z.string(),
  quality: z.number().int().min(1).max(100).optional(),
  format: z.enum(['jpeg', 'png', 'webp', 'avif']).optional(),
  progressive: z.boolean().optional(),
});

export const ImageOptimizeOutputSchema = z.object({
  input: z.string(),
  output: z.string(),
  format: z.string(),
  quality: z.number().int().optional(),
});

export type ImageOptimizeInput = z.infer<typeof ImageOptimizeInputSchema>;
export type ImageOptimizeOutput = z.infer<typeof ImageOptimizeOutputSchema>;

import { z } from 'zod';

export const ImageOptimizeInputSchema = z.object({
  input_path: z.string(),
  output_path: z.string(),
  format: z.enum(['png', 'jpg', 'webp', 'avif']).optional(),
  quality: z.number().int().min(1).max(100).default(80),
  strip_metadata: z.boolean().default(true),
});

export const ImageOptimizeOutputSchema = z.object({
  input_bytes: z.number(),
  output_bytes: z.number(),
  reduction_percent: z.number(),
  format_used: z.string(),
  dimensions: z.object({
    width: z.number(),
    height: z.number(),
  }),
});

export type ImageOptimizeInput = z.infer<typeof ImageOptimizeInputSchema>;
export type ImageOptimizeOutput = z.infer<typeof ImageOptimizeOutputSchema>;

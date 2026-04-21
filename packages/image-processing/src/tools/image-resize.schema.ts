import { z } from 'zod';

export const ImageResizeInputSchema = z.object({
  input: z.string(),
  output: z.string(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  fit: z.enum(['cover', 'contain', 'fill', 'inside', 'outside']).optional(),
  withoutEnlargement: z.boolean().optional(),
});

export const ImageResizeOutputSchema = z.object({
  input: z.string(),
  output: z.string(),
  width: z.number().int(),
  height: z.number().int(),
});

export type ImageResizeInput = z.infer<typeof ImageResizeInputSchema>;
export type ImageResizeOutput = z.infer<typeof ImageResizeOutputSchema>;

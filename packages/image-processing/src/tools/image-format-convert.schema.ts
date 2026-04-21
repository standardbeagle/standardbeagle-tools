import { z } from 'zod';

export const ImageFormatConvertInputSchema = z.object({
  input: z.string(),
  output: z.string(),
  format: z.enum(['jpeg', 'png', 'webp', 'avif', 'gif']),
  quality: z.number().int().min(1).max(100).optional(),
});

export const ImageFormatConvertOutputSchema = z.object({
  input: z.string(),
  output: z.string(),
  format: z.string(),
});

export type ImageFormatConvertInput = z.infer<typeof ImageFormatConvertInputSchema>;
export type ImageFormatConvertOutput = z.infer<typeof ImageFormatConvertOutputSchema>;

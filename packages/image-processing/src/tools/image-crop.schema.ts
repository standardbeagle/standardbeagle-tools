import { z } from 'zod';

export const ImageCropInputSchema = z.object({
  input: z.string(),
  output: z.string(),
  left: z.number().int().min(0),
  top: z.number().int().min(0),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const ImageCropOutputSchema = z.object({
  input: z.string(),
  output: z.string(),
  left: z.number().int(),
  top: z.number().int(),
  width: z.number().int(),
  height: z.number().int(),
});

export type ImageCropInput = z.infer<typeof ImageCropInputSchema>;
export type ImageCropOutput = z.infer<typeof ImageCropOutputSchema>;

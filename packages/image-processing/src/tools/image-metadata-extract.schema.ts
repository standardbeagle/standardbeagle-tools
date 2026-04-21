import { z } from 'zod';

export const ImageMetadataExtractInputSchema = z.object({
  input: z.string(),
});

export const ImageMetadataExtractOutputSchema = z.object({
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  format: z.string().optional(),
  space: z.string().optional(),
  density: z.number().optional(),
  hasAlpha: z.boolean().optional(),
  channels: z.number().int().optional(),
  size: z.number().int().optional(),
});

export type ImageMetadataExtractInput = z.infer<typeof ImageMetadataExtractInputSchema>;
export type ImageMetadataExtractOutput = z.infer<typeof ImageMetadataExtractOutputSchema>;

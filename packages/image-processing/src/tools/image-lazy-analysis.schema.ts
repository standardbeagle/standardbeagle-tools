import { z } from 'zod';

export const ImageLazyAnalysisInputSchema = z.object({
  images: z.array(z.string()),
});

export const ImageLazyAnalysisItemSchema = z.object({
  path: z.string(),
  width: z.number().int(),
  height: z.number().int(),
  fileSize: z.number().int(),
  renderWeight: z.number().int(),
  recommendation: z.enum(['eager', 'lazy', 'native']),
});

export const ImageLazyAnalysisOutputSchema = z.object({
  results: z.array(ImageLazyAnalysisItemSchema),
});

export type ImageLazyAnalysisInput = z.infer<typeof ImageLazyAnalysisInputSchema>;
export type ImageLazyAnalysisItem = z.infer<typeof ImageLazyAnalysisItemSchema>;
export type ImageLazyAnalysisOutput = z.infer<typeof ImageLazyAnalysisOutputSchema>;

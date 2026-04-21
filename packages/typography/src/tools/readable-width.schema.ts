import { z } from 'zod';

export const ReadableWidthInputSchema = z.object({
  fontSize: z.number(),
  contentWidth: z.number().optional(),
  measure: z.enum(['narrow', 'medium', 'wide']).optional(),
});

export const ReadableWidthOutputSchema = z.object({
  optimalWidth: z.number(),
  optimalChars: z.number(),
  cpl: z.number(),
});

export type ReadableWidthInput = z.infer<typeof ReadableWidthInputSchema>;
export type ReadableWidthOutput = z.infer<typeof ReadableWidthOutputSchema>;

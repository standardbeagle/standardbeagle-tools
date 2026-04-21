import { z } from 'zod';

export const LineHeightInputSchema = z.object({
  fontSize: z.number(),
  width: z.number().optional(),
  xHeight: z.number().optional(),
  language: z.string().optional(),
});

export const LineHeightOutputSchema = z.object({
  lineHeight: z.number(),
  lineHeightPx: z.number(),
});

export type LineHeightInput = z.infer<typeof LineHeightInputSchema>;
export type LineHeightOutput = z.infer<typeof LineHeightOutputSchema>;

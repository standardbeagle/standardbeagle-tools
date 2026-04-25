import { z } from 'zod';

export const FontMetricsInputSchema = z.object({
  font_path: z.string(),
});

export const FontMetricsOutputSchema = z.object({
  family: z.string(),
  style: z.string(),
  weight: z.number(),
  units_per_em: z.number(),
  ascent: z.number(),
  descent: z.number(),
  x_height: z.number(),
  cap_height: z.number(),
  line_gap: z.number(),
  recommended_line_height: z.number(),
});

export type FontMetricsInput = z.infer<typeof FontMetricsInputSchema>;
export type FontMetricsOutput = z.infer<typeof FontMetricsOutputSchema>;

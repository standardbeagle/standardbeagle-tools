import { z } from 'zod';

export const FontSubsetInputSchema = z.object({
  font_path: z.string(),
  unicode_ranges: z
    .array(z.string())
    .default(['U+0020-007F', 'U+00A0-00FF']),
  output_path: z.string().optional(),
  format: z.enum(['woff2', 'woff', 'ttf']).default('woff2'),
});

export const FontSubsetOutputSchema = z.object({
  output_path: z.string(),
  original_bytes: z.number(),
  subset_bytes: z.number(),
  reduction_percent: z.number(),
  glyphs_kept: z.number(),
});

export type FontSubsetInput = z.infer<typeof FontSubsetInputSchema>;
export type FontSubsetOutput = z.infer<typeof FontSubsetOutputSchema>;

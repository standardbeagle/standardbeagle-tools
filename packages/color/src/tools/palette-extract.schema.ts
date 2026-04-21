import { z } from 'zod';

export const PaletteExtractInputSchema = z.object({
  image: z.string(),
  k: z.number().int().min(2).max(16).default(5),
  sample_pixels: z.number().int().min(100).max(100000).default(10000),
});

export const PaletteExtractOutputSchema = z.object({
  palette: z.array(
    z.object({
      hex: z.string(),
      rgb: z.object({ r: z.number(), g: z.number(), b: z.number() }),
      percentage: z.number(),
    }),
  ),
});

export type PaletteExtractInput = z.infer<typeof PaletteExtractInputSchema>;
export type PaletteExtractOutput = z.infer<typeof PaletteExtractOutputSchema>;

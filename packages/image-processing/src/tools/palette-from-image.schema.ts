import { z } from 'zod';

export const PaletteFromImageInputSchema = z.object({
  input_path: z.string(),
  count: z.number().int().min(2).max(16).default(5),
  sample_pixels: z.number().int().min(100).max(100000).default(10000),
});

export const PaletteFromImageOutputSchema = z.object({
  palette: z.array(
    z.object({
      hex: z.string(),
      rgb: z.object({ r: z.number(), g: z.number(), b: z.number() }),
      percentage: z.number(),
    }),
  ),
});

export type PaletteFromImageInput = z.infer<typeof PaletteFromImageInputSchema>;
export type PaletteFromImageOutput = z.infer<typeof PaletteFromImageOutputSchema>;

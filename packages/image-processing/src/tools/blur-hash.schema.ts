import { z } from 'zod';

export const BlurHashInputSchema = z.object({
  input_path: z.string(),
  components_x: z.number().int().min(1).max(9).default(4),
  components_y: z.number().int().min(1).max(9).default(3),
  include_lqip: z.boolean().default(true),
});

export const BlurHashOutputSchema = z.object({
  blurhash: z.string(),
  lqip_base64: z.string().optional(),
  original_dimensions: z.object({
    w: z.number().int(),
    h: z.number().int(),
  }),
});

export type BlurHashInput = z.infer<typeof BlurHashInputSchema>;
export type BlurHashOutput = z.infer<typeof BlurHashOutputSchema>;

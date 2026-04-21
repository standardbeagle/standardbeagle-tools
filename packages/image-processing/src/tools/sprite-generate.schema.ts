import { z } from 'zod';

export const SpriteGenerateInputSchema = z.object({
  images: z.array(z.string()),
  output: z.string(),
  cssClassPrefix: z.string().optional(),
});

export const SpriteGenerateOutputSchema = z.object({
  sprite: z.string(),
  css: z.string(),
  width: z.number().int(),
  height: z.number().int(),
  icons: z.array(
    z.object({
      name: z.string(),
      width: z.number().int(),
      height: z.number().int(),
      x: z.number().int(),
      y: z.number().int(),
    }),
  ),
});

export type SpriteGenerateInput = z.infer<typeof SpriteGenerateInputSchema>;
export type SpriteGenerateOutput = z.infer<typeof SpriteGenerateOutputSchema>;

import { z } from 'zod';

export const TypeScaleGenerateInputSchema = z.object({
  base: z.number(),
  ratio: z.number().default(1.25),
  steps: z.array(z.number()).default([-2, -1, 0, 1, 2, 3, 4]),
});

export const TypeScaleGenerateOutputSchema = z.object({
  scale: z.array(
    z.object({
      name: z.string(),
      size: z.number(),
      lineHeight: z.number(),
    }),
  ),
});

export type TypeScaleGenerateInput = z.infer<typeof TypeScaleGenerateInputSchema>;
export type TypeScaleGenerateOutput = z.infer<typeof TypeScaleGenerateOutputSchema>;

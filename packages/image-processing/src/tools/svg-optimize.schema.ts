import { z } from 'zod';

export const SvgOptimizeInputSchema = z
  .object({
    svg: z.string().optional(),
    svg_path: z.string().optional(),
    output_path: z.string().optional(),
    aggressive: z.boolean().default(false),
    symbol_sprite: z.boolean().default(false),
  })
  .refine((d) => d.svg !== undefined || d.svg_path !== undefined, {
    message: 'Either svg or svg_path required',
  });

export const SvgOptimizeOutputSchema = z.object({
  optimized: z.string(),
  original_bytes: z.number().int(),
  optimized_bytes: z.number().int(),
  reduction_percent: z.number(),
});

export type SvgOptimizeInput = z.infer<typeof SvgOptimizeInputSchema>;
export type SvgOptimizeOutput = z.infer<typeof SvgOptimizeOutputSchema>;

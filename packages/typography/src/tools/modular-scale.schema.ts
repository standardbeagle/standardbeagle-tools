import { z } from 'zod';

export const ModularScaleInputSchema = z.object({
  base: z.number().default(16),
  ratio: z.number().default(1.25),
  steps_up: z.number().int().default(6),
  steps_down: z.number().int().default(2),
  output: z.enum(['px', 'rem', 'both']).default('both'),
  root_px: z.number().default(16),
  labels: z.array(z.string()).optional(),
});

export const ModularScaleOutputSchema = z.object({
  scale: z.array(
    z.object({
      label: z.string(),
      step: z.number(),
      px: z.string(),
      rem: z.string().optional(),
    }),
  ),
});

export type ModularScaleInput = z.infer<typeof ModularScaleInputSchema>;
export type ModularScaleOutput = z.infer<typeof ModularScaleOutputSchema>;

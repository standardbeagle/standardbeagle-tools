import { z } from 'zod';

export const VariableFontAxesInputSchema = z.object({
  font_path: z.string(),
});

export const VariableFontAxisSchema = z.object({
  tag: z.string(),
  name: z.string(),
  min: z.number(),
  max: z.number(),
  default: z.number(),
});

export const VariableFontInstanceSchema = z.object({
  name: z.string(),
  coordinates: z.record(z.number()),
});

export const VariableFontAxesOutputSchema = z.object({
  is_variable: z.boolean(),
  axes: z.array(VariableFontAxisSchema),
  instances: z.array(VariableFontInstanceSchema),
  css_example: z.string(),
});

export type VariableFontAxesInput = z.infer<typeof VariableFontAxesInputSchema>;
export type VariableFontAxis = z.infer<typeof VariableFontAxisSchema>;
export type VariableFontInstance = z.infer<typeof VariableFontInstanceSchema>;
export type VariableFontAxesOutput = z.infer<typeof VariableFontAxesOutputSchema>;

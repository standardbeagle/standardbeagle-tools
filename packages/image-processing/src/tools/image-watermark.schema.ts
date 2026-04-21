import { z } from 'zod';

export const ImageWatermarkInputSchema = z.object({
  input: z.string(),
  output: z.string(),
  text: z.string(),
  position: z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']).optional(),
  fontSize: z.number().int().positive().optional(),
  color: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
});

export const ImageWatermarkOutputSchema = z.object({
  input: z.string(),
  output: z.string(),
  text: z.string(),
  position: z.string(),
});

export type ImageWatermarkInput = z.infer<typeof ImageWatermarkInputSchema>;
export type ImageWatermarkOutput = z.infer<typeof ImageWatermarkOutputSchema>;

import { z } from 'zod';

export const ResponsiveGenerateInputSchema = z.object({
  input_path: z.string(),
  output_dir: z.string(),
  breakpoints: z.array(z.number().int().positive()).default([320, 640, 960, 1280, 1920]),
  format: z.enum(['webp', 'avif', 'jpg']).default('webp'),
  quality: z.number().int().min(1).max(100).default(80),
});

export const ResponsiveGenerateVariantSchema = z.object({
  width: z.number().int(),
  path: z.string(),
  bytes: z.number().int(),
});

export const ResponsiveGenerateOutputSchema = z.object({
  variants: z.array(ResponsiveGenerateVariantSchema),
  srcset: z.string(),
  sizes_suggestion: z.string(),
});

export type ResponsiveGenerateInput = z.infer<typeof ResponsiveGenerateInputSchema>;
export type ResponsiveGenerateVariant = z.infer<typeof ResponsiveGenerateVariantSchema>;
export type ResponsiveGenerateOutput = z.infer<typeof ResponsiveGenerateOutputSchema>;

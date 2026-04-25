import { z } from 'zod';

export const PdfA11yInputSchema = z.object({
  pdf_path: z.string(),
});

export type PdfA11yInput = z.infer<typeof PdfA11yInputSchema>;

export const PdfA11yOutputSchema = z.object({
  is_tagged: z.boolean(),
  language: z.string().optional(),
  title: z.string().optional(),
  has_structure_tree: z.boolean(),
  image_count: z.number(),
  images_with_alt: z.number(),
  form_fields_total: z.number(),
  form_fields_labeled: z.number(),
  reading_order_defined: z.boolean(),
  score: z.number(),
  issues: z.array(z.string()),
});

export type PdfA11yOutput = z.infer<typeof PdfA11yOutputSchema>;

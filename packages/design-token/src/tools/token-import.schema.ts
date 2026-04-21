import { z } from 'zod';

export const TokenImportInputSchema = z.object({
  source: z.string(),
  format: z.enum(['json', 'css', 'scss']),
});

export const TokenImportOutputSchema = z.object({
  tokens: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
      type: z.enum(['color', 'size', 'spacing', 'font', 'border', 'radius', 'shadow']),
      description: z.string().optional(),
      reference: z.string().optional(),
    }),
  ),
});

export type TokenImportInput = z.infer<typeof TokenImportInputSchema>;
export type TokenImportOutput = z.infer<typeof TokenImportOutputSchema>;

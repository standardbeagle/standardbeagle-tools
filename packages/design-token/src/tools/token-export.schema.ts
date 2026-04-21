import { z } from 'zod';
import { TokenSchema } from './token-create.schema.js';

export const TokenExportInputSchema = z.object({
  tokens: z.array(TokenSchema),
  format: z.enum(['css-vars', 'scss', 'json', 'android-xml', 'ios-swift']),
  prefix: z.string().optional(),
  includeCategories: z.array(z.enum(['color', 'size', 'spacing', 'font', 'border', 'radius', 'shadow'])).optional(),
  excludeCategories: z.array(z.enum(['color', 'size', 'spacing', 'font', 'border', 'radius', 'shadow'])).optional(),
});

export const TokenExportOutputSchema = z.object({
  result: z.string(),
});

export type TokenExportInput = z.infer<typeof TokenExportInputSchema>;
export type TokenExportOutput = z.infer<typeof TokenExportOutputSchema>;

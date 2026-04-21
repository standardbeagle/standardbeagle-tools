import { z } from 'zod';
import { TokenSchema } from './token-create.schema.js';

export const TokenValidateInputSchema = z.object({
  tokens: z.array(TokenSchema),
});

export const TokenValidateOutputSchema = z.object({
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
});

export type TokenValidateInput = z.infer<typeof TokenValidateInputSchema>;
export type TokenValidateOutput = z.infer<typeof TokenValidateOutputSchema>;

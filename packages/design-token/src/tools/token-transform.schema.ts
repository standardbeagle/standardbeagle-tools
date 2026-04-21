import { z } from 'zod';
import { TokenSchema } from './token-create.schema.js';

export const TokenTransformInputSchema = z.object({
  tokens: z.array(TokenSchema),
  format: z.enum(['css-vars', 'scss', 'json', 'android-xml', 'ios-swift']),
});

export const TokenTransformOutputSchema = z.object({
  result: z.string(),
});

export type TokenTransformInput = z.infer<typeof TokenTransformInputSchema>;
export type TokenTransformOutput = z.infer<typeof TokenTransformOutputSchema>;

import { z } from 'zod';

export const TokensValidateInputSchema = z.object({
  tokens: z.record(z.string(), z.any()),
  strict: z.boolean().default(false),
});

const IssueSchema = z.object({
  path: z.string(),
  message: z.string(),
  code: z.string(),
});

export const TokensValidateOutputSchema = z.object({
  valid: z.boolean(),
  errors: z.array(IssueSchema),
  warnings: z.array(IssueSchema),
});

export type TokensValidateInput = z.infer<typeof TokensValidateInputSchema>;
export type TokensValidateOutput = z.infer<typeof TokensValidateOutputSchema>;

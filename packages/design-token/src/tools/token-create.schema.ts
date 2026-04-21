import { z } from 'zod';

export const TokenSchema = z.object({
  name: z.string(),
  value: z.string(),
  type: z.enum(['color', 'size', 'spacing', 'font', 'border', 'radius', 'shadow']),
  description: z.string().optional(),
  reference: z.string().optional(),
});

export const TokenCreateInputSchema = z.object({
  name: z.string(),
  value: z.string(),
  type: z.enum(['color', 'size', 'spacing', 'font', 'border', 'radius', 'shadow']),
  description: z.string().optional(),
  reference: z.string().optional(),
  tokens: z.array(TokenSchema).optional(),
});

export const TokenCreateOutputSchema = z.object({
  name: z.string(),
  value: z.string(),
  type: z.enum(['color', 'size', 'spacing', 'font', 'border', 'radius', 'shadow']),
  description: z.string().optional(),
  reference: z.string().optional(),
  computedValue: z.string(),
});

export type Token = z.infer<typeof TokenSchema>;
export type TokenCreateInput = z.infer<typeof TokenCreateInputSchema>;
export type TokenCreateOutput = z.infer<typeof TokenCreateOutputSchema>;

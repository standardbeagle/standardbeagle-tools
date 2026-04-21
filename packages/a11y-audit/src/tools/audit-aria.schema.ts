import { z } from 'zod';

export const AuditAriaInputSchema = z.object({
  html: z.string(),
  rules: z.array(z.string()).optional(),
  tags: z.array(z.enum(['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'best-practice'])).optional(),
});

export type AuditAriaInput = z.infer<typeof AuditAriaInputSchema>;

import { z } from 'zod';

export const AuditHtmlInputSchema = z.object({
  html: z.string(),
  rules: z.array(z.string()).optional(),
  tags: z.array(z.enum(['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'best-practice'])).default(['wcag21aa']),
});

export const AuditHtmlOutputSchema = z.object({
  violations: z.array(
    z.object({
      id: z.string(),
      impact: z.enum(['minor', 'moderate', 'serious', 'critical']),
      help: z.string(),
      wcag_refs: z.array(z.string()),
      nodes: z.array(
        z.object({
          html: z.string(),
          target: z.array(z.string()),
          failure_summary: z.string(),
        }),
      ),
    }),
  ),
  passes: z.number(),
  incomplete: z.number(),
  inapplicable: z.number(),
});

export type AuditHtmlInput = z.infer<typeof AuditHtmlInputSchema>;
export type AuditHtmlOutput = z.infer<typeof AuditHtmlOutputSchema>;

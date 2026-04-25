import { z } from 'zod';

export const LinkTextCheckInputSchema = z.object({
  html: z.string(),
});

export type LinkTextCheckInput = z.infer<typeof LinkTextCheckInputSchema>;

export const LinkTextIssueSchema = z.enum([
  'vague-text',
  'url-as-text',
  'empty-text',
  'duplicate-text-different-href',
]);

export type LinkTextIssue = z.infer<typeof LinkTextIssueSchema>;

export const LinkTextCheckOutputSchema = z.object({
  links: z.array(
    z.object({
      text: z.string(),
      href: z.string(),
      issues: z.array(LinkTextIssueSchema),
      suggested_text: z.string().optional(),
    }),
  ),
});

export type LinkTextCheckOutput = z.infer<typeof LinkTextCheckOutputSchema>;

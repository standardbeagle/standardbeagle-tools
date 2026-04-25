import { z } from 'zod';

export const AriaValidateInputSchema = z.object({
  html: z.string(),
});

export type AriaValidateInput = z.infer<typeof AriaValidateInputSchema>;

export const AriaValidateIssueSchema = z.object({
  selector: z.string(),
  role: z.string().optional(),
  violation: z.enum([
    'invalid-role',
    'missing-required-prop',
    'prohibited-prop',
    'redundant-role',
    'invalid-prop-value',
  ]),
  detail: z.string(),
});

export const AriaValidateOutputSchema = z.object({
  issues: z.array(AriaValidateIssueSchema),
});

export type AriaValidateIssue = z.infer<typeof AriaValidateIssueSchema>;
export type AriaValidateOutput = z.infer<typeof AriaValidateOutputSchema>;

import { z } from 'zod';

export const HeadingStructureInputSchema = z.object({
  html: z.string(),
});

export type HeadingStructureInput = z.infer<typeof HeadingStructureInputSchema>;

export const HeadingStructureIssueSchema = z.object({
  type: z.enum(['skipped_level', 'missing_h1', 'multiple_h1', 'empty_heading']),
  location: z.string(),
  fix: z.string(),
});

export const HeadingStructureOutputSchema = z.object({
  outline: z.array(
    z.object({
      level: z.number(),
      text: z.string(),
      id: z.string().optional(),
    }),
  ),
  issues: z.array(HeadingStructureIssueSchema),
  has_h1: z.boolean(),
  max_depth: z.number(),
});

export type HeadingStructureOutput = z.infer<typeof HeadingStructureOutputSchema>;

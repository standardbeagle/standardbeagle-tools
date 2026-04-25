import { z } from 'zod';

export const WcagScoreInputSchema = z.object({
  html: z.string(),
  target_level: z.enum(['A', 'AA', 'AAA']).default('AA'),
});

const LevelSummarySchema = z.object({
  passed: z.number(),
  failed: z.number(),
  score: z.number(),
});

const CriterionResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  level: z.enum(['A', 'AA', 'AAA']),
  status: z.enum(['pass', 'fail', 'inapplicable', 'untestable']),
});

export const WcagScoreOutputSchema = z.object({
  level_a: LevelSummarySchema,
  level_aa: LevelSummarySchema,
  level_aaa: LevelSummarySchema,
  criteria: z.array(CriterionResultSchema),
  compliance_report_markdown: z.string(),
});

export type WcagScoreInput = z.infer<typeof WcagScoreInputSchema>;
export type WcagScoreOutput = z.infer<typeof WcagScoreOutputSchema>;
export type CriterionResult = z.infer<typeof CriterionResultSchema>;
export type LevelSummary = z.infer<typeof LevelSummarySchema>;

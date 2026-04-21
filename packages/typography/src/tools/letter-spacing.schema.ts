import { z } from 'zod';

export const LetterSpacingInputSchema = z.object({
  fontSize: z.number(),
  useCase: z.enum(['body', 'heading', 'display', 'caption', 'button']).optional(),
});

export const LetterSpacingOutputSchema = z.object({
  tracking: z.number(),
  letterSpacingPx: z.number(),
});

export type LetterSpacingInput = z.infer<typeof LetterSpacingInputSchema>;
export type LetterSpacingOutput = z.infer<typeof LetterSpacingOutputSchema>;

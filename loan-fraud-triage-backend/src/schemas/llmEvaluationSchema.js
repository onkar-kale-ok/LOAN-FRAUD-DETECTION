import { z } from 'zod';

const redFlagSchema = z
  .object({
    code: z.string().optional(),
    label: z.string().optional(),
    evidence: z.string().optional(),
  })
  .passthrough();

export const llmEvaluationSchema = z.object({
  riskScore: z.coerce.number().finite(),
  riskTier: z
    .string()
    .optional()
    .transform((value) => (value ? String(value).toUpperCase() : value)),
  redFlags: z.array(redFlagSchema).optional().default([]),
  aiReviewerNote: z.string().optional().default(''),
});

export default { llmEvaluationSchema };

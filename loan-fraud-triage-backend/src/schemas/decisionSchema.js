import { z } from 'zod';

export const DECISION_STATUSES = /** @type {const} */ ([
  'APPROVED',
  'REJECTED',
  'FLAGGED_FOR_AUDIT',
  'PENDING_REVIEW',
]);

export const decisionBodySchema = z.object({
  decisionStatus: z.enum(DECISION_STATUSES),
  reviewerNotes: z.string().optional().default(''),
});

export default { DECISION_STATUSES, decisionBodySchema };

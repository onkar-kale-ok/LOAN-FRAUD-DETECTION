import { z } from 'zod';
import { evaluationSchema } from '../schemas/evaluationSchema.js';

export const evaluateBodySchema = evaluationSchema;

export const chatBodySchema = z
  .object({
    message: z.string().optional(),
  })
  .passthrough();

/**
 * Zod validation placeholder. Currently allows any JSON body through
 * after a lightweight parse so routes can be wired without blocking clients.
 */
export function validateBody(schema = z.object({}).passthrough()) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: result.error.flatten(),
      });
    }
    req.body = result.data;
    return next();
  };
}

export default { validateBody, evaluateBodySchema, chatBodySchema };

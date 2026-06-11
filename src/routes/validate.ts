import { Hono } from 'hono';
import { z } from 'zod';
import type { AppEnv } from '../types/index.js';
import { apiKeyMiddleware } from '../middleware/api-key.js';
import { runEngine } from '../rules/engine.js';

const ValidateRequestSchema = z.object({
  invoice: z.object({
    invoice_number: z.string().optional(),
    issue_date: z.string().optional(),
    seller: z
      .object({
        name: z.string().optional(),
        country: z.string().optional(),
      })
      .optional(),
    buyer: z
      .object({
        name: z.string().optional(),
        country: z.string().optional(),
      })
      .optional(),
    currency: z.string().optional(),
    total_amount: z.number().optional(),
  }),
  target_profile: z.string().min(1),
  options: z
    .object({
      strict: z.boolean().optional(),
    })
    .optional(),
});

const validate = new Hono<AppEnv>();

validate.post('/validate', apiKeyMiddleware, async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Request body must be valid JSON' }, 400);
  }

  const parsed = ValidateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      {
        error: 'Invalid request payload',
        details: parsed.error.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
      },
      400,
    );
  }

  const { invoice, target_profile } = parsed.data;
  const result = runEngine(invoice, target_profile);

  return c.json(result, 200);
});

export { validate };

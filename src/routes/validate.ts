import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { z } from 'zod';
import type { AppEnv } from '../types/index.js';
import { apiKeyMiddleware } from '../middleware/api-key.js';
import { rateLimitMiddleware } from '../middleware/rate-limit.js';
import { runEngine } from '../rules/engine.js';

const MAX_BODY_BYTES = 1 * 1024 * 1024; // 1MB — invoices are small; reject oversized to prevent abuse

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

validate.post(
  '/validate',
  bodyLimit({
    maxSize: MAX_BODY_BYTES,
    onError: (c) =>
      c.json({ error: 'Request body too large', max_bytes: MAX_BODY_BYTES }, 413),
  }),
  rateLimitMiddleware,
  apiKeyMiddleware,
  async (c) => {
    const contentType = c.req.header('Content-Type') ?? '';
    if (!contentType.includes('application/json')) {
      return c.json(
        { error: 'Content-Type must be application/json', received: contentType || '(none)' },
        415,
      );
    }

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
  },
);

export { validate };

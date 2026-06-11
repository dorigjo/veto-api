import { createMiddleware } from 'hono/factory';
import type { AppEnv } from '../types/index.js';

export const apiKeyMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const headerKey = c.req.header('X-API-Key');
  const bearerKey = c.req.header('Authorization')?.replace(/^Bearer\s+/i, '');
  const apiKey = headerKey ?? bearerKey;

  if (!apiKey) {
    return c.json({ error: 'API key required', hint: 'Provide X-API-Key header or Authorization: Bearer <key>' }, 401);
  }

  const raw = c.env?.VALID_API_KEYS ?? '';
  const validKeys = raw.split(',').map((k) => k.trim()).filter(Boolean);

  if (!validKeys.includes(apiKey)) {
    return c.json({ error: 'Invalid API key' }, 401);
  }

  await next();
});

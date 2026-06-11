import { createMiddleware } from 'hono/factory';
import type { AppEnv } from '../types/index.js';

// Cloudflare Rate Limiting middleware — gracefully degraded when binding is absent.
// When RATE_LIMITER binding is not configured, all requests pass through (dev / pre-activation).
// When present, enforces per-API-key limits declared in wrangler.toml + Cloudflare dashboard.
// See docs/RATE_LIMITING.md for setup, configuration, and tuning guidance.
export const rateLimitMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const rateLimiter = c.env?.RATE_LIMITER;

  if (!rateLimiter) {
    await next();
    return;
  }

  // Extract raw key from header — validation happens downstream in apiKeyMiddleware.
  // Using the raw value as the rate-limit bucket key before auth intentionally
  // protects against brute-force credential probing too.
  const apiKey =
    c.req.header('X-API-Key') ??
    c.req.header('Authorization')?.replace(/^Bearer\s+/i, '') ??
    'unauthenticated';

  const { success } = await rateLimiter.limit({ key: `veto:v1:${apiKey}` });

  if (!success) {
    return c.json(
      {
        error: 'Rate limit exceeded',
        retry_after_seconds: 60,
      },
      429,
    );
  }

  await next();
});

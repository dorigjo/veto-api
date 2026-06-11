import { Hono } from 'hono';
import type { AppEnv } from '../types/index.js';

const health = new Hono<AppEnv>();

health.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export { health };

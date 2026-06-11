import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import type { AppEnv } from './types/index.js';
import { health } from './routes/health.js';
import { version } from './routes/version.js';
import { validate } from './routes/validate.js';

const app = new Hono<AppEnv>();

app.use('*', secureHeaders());
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'X-API-Key', 'Authorization'],
  }),
);

app.route('/v1', health);
app.route('/v1', version);
app.route('/v1', validate);

app.notFound((c) => c.json({ error: 'Not found' }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;

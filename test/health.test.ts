import { describe, it, expect } from 'vitest';
import app from '../src/index.js';

describe('GET /v1/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await app.request('/v1/health');
    expect(res.status).toBe(200);
    const body = await res.json() as { status: string; timestamp: string };
    expect(body.status).toBe('ok');
    expect(typeof body.timestamp).toBe('string');
  });

  it('does not require an API key', async () => {
    const res = await app.request('/v1/health');
    expect(res.status).toBe(200);
  });
});

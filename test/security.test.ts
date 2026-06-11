import { describe, it, expect } from 'vitest';
import app from '../src/index.js';

const TEST_ENV = { VALID_API_KEYS: 'veto-test-key-123' };

describe('POST /v1/validate — auth edge cases', () => {
  it('returns 401 when API key is missing', async () => {
    const res = await app.request(
      '/v1/validate',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' },
      TEST_ENV,
    );
    expect(res.status).toBe(401);
    const body = await res.json() as { error: string };
    expect(typeof body.error).toBe('string');
  });

  it('returns 401 for invalid API key', async () => {
    const res = await app.request(
      '/v1/validate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': 'not-a-real-key' },
        body: '{}',
      },
      TEST_ENV,
    );
    expect(res.status).toBe(401);
  });

  it('returns 401 for empty API key header', async () => {
    const res = await app.request(
      '/v1/validate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': '' },
        body: '{}',
      },
      TEST_ENV,
    );
    expect(res.status).toBe(401);
  });

  it('returns 401 for wrong Bearer token', async () => {
    const res = await app.request(
      '/v1/validate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer wrong-key' },
        body: '{}',
      },
      TEST_ENV,
    );
    expect(res.status).toBe(401);
  });
});

describe('POST /v1/validate — content-type enforcement', () => {
  it('returns 415 when Content-Type is text/plain', async () => {
    const res = await app.request(
      '/v1/validate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain', 'X-API-Key': 'veto-test-key-123' },
        body: 'some text',
      },
      TEST_ENV,
    );
    expect(res.status).toBe(415);
  });

  it('returns 415 when Content-Type is application/xml', async () => {
    const res = await app.request(
      '/v1/validate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml', 'X-API-Key': 'veto-test-key-123' },
        body: '<invoice/>',
      },
      TEST_ENV,
    );
    expect(res.status).toBe(415);
  });

  it('returns 415 when Content-Type is missing', async () => {
    const res = await app.request(
      '/v1/validate',
      {
        method: 'POST',
        headers: { 'X-API-Key': 'veto-test-key-123' },
        body: '{}',
      },
      TEST_ENV,
    );
    expect(res.status).toBe(415);
  });

  it('accepts application/json; charset=utf-8', async () => {
    const res = await app.request(
      '/v1/validate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'X-API-Key': 'veto-test-key-123',
        },
        body: JSON.stringify({ invoice: {}, target_profile: 'EN16931' }),
      },
      TEST_ENV,
    );
    expect(res.status).toBe(200);
  });
});

describe('POST /v1/validate — oversized payload', () => {
  it('returns 413 when body exceeds 1MB', async () => {
    const oversizedData = 'x'.repeat(1024 * 1024 + 1);
    const bigBody = JSON.stringify({ invoice: { extra: oversizedData }, target_profile: 'EN16931' });

    const res = await app.request(
      '/v1/validate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'veto-test-key-123',
          'Content-Length': String(bigBody.length),
        },
        body: bigBody,
      },
      TEST_ENV,
    );
    expect(res.status).toBe(413);
  });
});

describe('POST /v1/validate — malformed input', () => {
  it('returns 400 for malformed JSON', async () => {
    const res = await app.request(
      '/v1/validate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': 'veto-test-key-123' },
        body: '{ invalid json }',
      },
      TEST_ENV,
    );
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('JSON');
  });

  it('returns 400 for empty JSON object without target_profile', async () => {
    const res = await app.request(
      '/v1/validate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': 'veto-test-key-123' },
        body: '{}',
      },
      TEST_ENV,
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 for null body fields', async () => {
    const res = await app.request(
      '/v1/validate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': 'veto-test-key-123' },
        body: JSON.stringify({ invoice: null, target_profile: 'EN16931' }),
      },
      TEST_ENV,
    );
    expect(res.status).toBe(400);
  });
});

describe('Response structure — error responses', () => {
  it('404 returns JSON with error field', async () => {
    const res = await app.request('/v1/nonexistent', { method: 'GET' }, TEST_ENV);
    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(typeof body.error).toBe('string');
  });
});

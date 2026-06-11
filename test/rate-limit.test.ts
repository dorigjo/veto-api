import { describe, it, expect, vi, afterEach } from 'vitest';
import app from '../src/index.js';

afterEach(() => {
  vi.restoreAllMocks();
});

const VALID_BODY = JSON.stringify({
  invoice: {
    invoice_number: 'INV-RATE-001',
    issue_date: '2024-11-15',
    seller: { name: 'Acme GmbH', country: 'DE' },
    buyer: { name: 'Beta Corp', country: 'FR' },
    currency: 'EUR',
    total_amount: 500,
  },
  target_profile: 'EN16931',
});

const HEADERS = { 'Content-Type': 'application/json', 'X-API-Key': 'veto-test-key-123' };

describe('Rate-limit middleware — graceful degradation', () => {
  it('requests pass through when RATE_LIMITER binding is absent', async () => {
    const res = await app.request(
      '/v1/validate',
      { method: 'POST', headers: HEADERS, body: VALID_BODY },
      { VALID_API_KEYS: 'veto-test-key-123' }, // no RATE_LIMITER
    );
    expect(res.status).toBe(200);
  });

  it('returns 429 when RATE_LIMITER returns { success: false }', async () => {
    const mockLimiter = { limit: vi.fn().mockResolvedValue({ success: false }) };
    const res = await app.request(
      '/v1/validate',
      { method: 'POST', headers: HEADERS, body: VALID_BODY },
      { VALID_API_KEYS: 'veto-test-key-123', RATE_LIMITER: mockLimiter },
    );
    expect(res.status).toBe(429);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Rate limit exceeded');
  });

  it('passes through when RATE_LIMITER returns { success: true }', async () => {
    const mockLimiter = { limit: vi.fn().mockResolvedValue({ success: true }) };
    const res = await app.request(
      '/v1/validate',
      { method: 'POST', headers: HEADERS, body: VALID_BODY },
      { VALID_API_KEYS: 'veto-test-key-123', RATE_LIMITER: mockLimiter },
    );
    expect(res.status).toBe(200);
  });

  it('rate limiter is called with a prefixed key (never the raw API key)', async () => {
    const mockLimiter = { limit: vi.fn().mockResolvedValue({ success: true }) };
    await app.request(
      '/v1/validate',
      { method: 'POST', headers: HEADERS, body: VALID_BODY },
      { VALID_API_KEYS: 'veto-test-key-123', RATE_LIMITER: mockLimiter },
    );
    expect(mockLimiter.limit).toHaveBeenCalledOnce();
    const callArg = mockLimiter.limit.mock.calls[0][0] as { key: string };
    expect(callArg.key).toMatch(/^veto:v1:/);
  });

  it('rate limit check happens before auth — even unauthenticated requests are rate-limited', async () => {
    const mockLimiter = { limit: vi.fn().mockResolvedValue({ success: false }) };
    const res = await app.request(
      '/v1/validate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // no API key
        body: VALID_BODY,
      },
      { VALID_API_KEYS: 'veto-test-key-123', RATE_LIMITER: mockLimiter },
    );
    // Rate limit fires before auth — returns 429, not 401
    expect(res.status).toBe(429);
  });
});

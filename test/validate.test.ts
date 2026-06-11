import { describe, it, expect } from 'vitest';
import app from '../src/index.js';
import type { ValidationResponse } from '../src/types/index.js';
import { STORAGE_STATEMENT } from '../src/lib/version.js';

const TEST_ENV = { VALID_API_KEYS: 'veto-test-key-123' };
const AUTH_HEADER = { 'X-API-Key': 'veto-test-key-123' };

function postValidate(body: unknown, apiKey?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey !== undefined) headers['X-API-Key'] = apiKey;
  return app.request(
    '/v1/validate',
    { method: 'POST', headers, body: JSON.stringify(body) },
    TEST_ENV,
  );
}

describe('POST /v1/validate — auth', () => {
  it('returns 401 when API key is missing', async () => {
    const res = await app.request('/v1/validate', { method: 'POST' }, TEST_ENV);
    expect(res.status).toBe(401);
  });

  it('returns 401 when API key is wrong', async () => {
    const res = await postValidate({}, 'wrong-key');
    expect(res.status).toBe(401);
  });

  it('accepts Bearer token', async () => {
    const res = await app.request(
      '/v1/validate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer veto-test-key-123',
        },
        body: JSON.stringify({ invoice: {}, target_profile: 'EN16931' }),
      },
      TEST_ENV,
    );
    expect(res.status).toBe(200);
  });
});

describe('POST /v1/validate — request validation', () => {
  it('returns 400 for missing target_profile', async () => {
    const res = await postValidate({ invoice: {} }, AUTH_HEADER['X-API-Key']);
    expect(res.status).toBe(400);
  });

  it('returns 400 for non-JSON body', async () => {
    const res = await app.request(
      '/v1/validate',
      { method: 'POST', headers: { 'Content-Type': 'application/json', ...AUTH_HEADER }, body: 'not json' },
      TEST_ENV,
    );
    expect(res.status).toBe(400);
  });
});

describe('POST /v1/validate — valid invoice', () => {
  const validPayload = {
    invoice: {
      invoice_number: 'INV-2024-0001',
      issue_date: '2024-11-15',
      seller: { name: 'Acme GmbH', country: 'DE' },
      buyer: { name: 'Beta Corp', country: 'FR' },
      currency: 'EUR',
      total_amount: 1190.0,
    },
    target_profile: 'EN16931',
  };

  it('returns VALID decision', async () => {
    const res = await postValidate(validPayload, AUTH_HEADER['X-API-Key']);
    expect(res.status).toBe(200);
    const body = (await res.json()) as ValidationResponse;
    expect(body.decision).toBe('VALID');
    expect(body.blocking_errors).toHaveLength(0);
  });

  it('includes required response fields', async () => {
    const res = await postValidate(validPayload, AUTH_HEADER['X-API-Key']);
    const body = (await res.json()) as ValidationResponse;
    expect(typeof body.request_id).toBe('string');
    expect(typeof body.engine_version).toBe('string');
    expect(typeof body.rule_pack_version).toBe('string');
    expect(body.target_profile).toBe('EN16931');
    expect(Array.isArray(body.trace)).toBe(true);
    expect(body.storage_statement).toBe(STORAGE_STATEMENT);
  });
});

describe('POST /v1/validate — invalid invoice', () => {
  it('returns INVALID when invoice_number is missing', async () => {
    const res = await postValidate(
      { invoice: { issue_date: '2024-11-15', seller: { country: 'DE' }, buyer: { country: 'FR' }, currency: 'EUR', total_amount: 100 }, target_profile: 'EN16931' },
      AUTH_HEADER['X-API-Key'],
    );
    const body = (await res.json()) as ValidationResponse;
    expect(body.decision).toBe('INVALID');
    expect(body.blocking_errors.some((e) => e.rule_id === 'BR-01')).toBe(true);
  });

  it('returns INVALID for unsupported profile', async () => {
    const res = await postValidate(
      { invoice: {}, target_profile: 'UNKNOWN-PROFILE' },
      AUTH_HEADER['X-API-Key'],
    );
    const body = (await res.json()) as ValidationResponse;
    expect(body.decision).toBe('INVALID');
    expect(body.blocking_errors.some((e) => e.rule_id === 'VT-01')).toBe(true);
  });

  it('catches multiple violations at once', async () => {
    const res = await postValidate(
      { invoice: { currency: 'EUROS' }, target_profile: 'EN16931' },
      AUTH_HEADER['X-API-Key'],
    );
    const body = (await res.json()) as ValidationResponse;
    expect(body.decision).toBe('INVALID');
    const ruleIds = body.blocking_errors.map((e) => e.rule_id);
    expect(ruleIds).toContain('BR-01');
    expect(ruleIds).toContain('BR-02');
    expect(ruleIds).toContain('BR-04');
    expect(ruleIds).toContain('BR-07');
    expect(ruleIds).toContain('BR-09');
    expect(ruleIds).toContain('BR-CL-04');
  });

  it('returns INVALID for missing seller country', async () => {
    const res = await postValidate(
      {
        invoice: { invoice_number: 'X', issue_date: '2024-01-01', seller: { name: 'Acme' }, buyer: { country: 'DE' }, currency: 'EUR', total_amount: 100 },
        target_profile: 'EN16931',
      },
      AUTH_HEADER['X-API-Key'],
    );
    const body = (await res.json()) as ValidationResponse;
    expect(body.blocking_errors.some((e) => e.rule_id === 'BR-04')).toBe(true);
  });

  it('returns INVALID for missing buyer country', async () => {
    const res = await postValidate(
      {
        invoice: { invoice_number: 'X', issue_date: '2024-01-01', seller: { country: 'DE' }, buyer: { name: 'Beta' }, currency: 'EUR', total_amount: 100 },
        target_profile: 'EN16931',
      },
      AUTH_HEADER['X-API-Key'],
    );
    const body = (await res.json()) as ValidationResponse;
    expect(body.blocking_errors.some((e) => e.rule_id === 'BR-07')).toBe(true);
  });

  it('returns INVALID for invalid currency format', async () => {
    const res = await postValidate(
      {
        invoice: { invoice_number: 'X', issue_date: '2024-01-01', seller: { country: 'DE' }, buyer: { country: 'FR' }, currency: 'euro', total_amount: 100 },
        target_profile: 'EN16931',
      },
      AUTH_HEADER['X-API-Key'],
    );
    const body = (await res.json()) as ValidationResponse;
    expect(body.blocking_errors.some((e) => e.rule_id === 'BR-CL-04')).toBe(true);
  });
});

describe('POST /v1/validate — warning path', () => {
  it('returns WARNING for negative total amount', async () => {
    const res = await postValidate(
      {
        invoice: {
          invoice_number: 'CN-001',
          issue_date: '2024-11-15',
          seller: { country: 'DE' },
          buyer: { country: 'FR' },
          currency: 'EUR',
          total_amount: -50.0,
        },
        target_profile: 'EN16931',
      },
      AUTH_HEADER['X-API-Key'],
    );
    const body = (await res.json()) as ValidationResponse;
    expect(body.decision).toBe('WARNING');
    expect(body.warnings.some((w) => w.rule_id === 'BR-DEC-01')).toBe(true);
    expect(body.blocking_errors).toHaveLength(0);
  });
});

describe('POST /v1/validate — PEPPOL profile', () => {
  it('accepts PEPPOL-BIS-3.0 as valid profile', async () => {
    const res = await postValidate(
      {
        invoice: {
          invoice_number: 'INV-001',
          issue_date: '2024-11-15',
          seller: { country: 'DE' },
          buyer: { country: 'NL' },
          currency: 'EUR',
          total_amount: 500.0,
        },
        target_profile: 'PEPPOL-BIS-3.0',
      },
      AUTH_HEADER['X-API-Key'],
    );
    const body = (await res.json()) as ValidationResponse;
    expect(body.target_profile).toBe('PEPPOL-BIS-3.0');
    expect(body.decision).toBe('VALID');
  });
});

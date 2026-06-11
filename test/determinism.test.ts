import { describe, it, expect } from 'vitest';
import app from '../src/index.js';
import type { ValidationResponse } from '../src/types/index.js';

const TEST_ENV = { VALID_API_KEYS: 'veto-test-key-123' };

async function postValidate(body: unknown): Promise<ValidationResponse> {
  const res = await app.request(
    '/v1/validate',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': 'veto-test-key-123' },
      body: JSON.stringify(body),
    },
    TEST_ENV,
  );
  return res.json() as Promise<ValidationResponse>;
}

const STABLE_VALID_PAYLOAD = {
  invoice: {
    invoice_number: 'INV-DETERM-001',
    issue_date: '2024-11-15',
    seller: { name: 'Acme GmbH', country: 'DE' },
    buyer: { name: 'Beta Corp', country: 'FR' },
    currency: 'EUR',
    total_amount: 1190.0,
  },
  target_profile: 'EN16931',
};

const STABLE_INVALID_PAYLOAD = {
  invoice: {
    invoice_number: 'INV-DETERM-002',
    currency: 'EUROS',
  },
  target_profile: 'EN16931',
};

describe('Determinism — identical inputs produce identical outputs', () => {
  it('VALID decision is identical across two calls', async () => {
    const r1 = await postValidate(STABLE_VALID_PAYLOAD);
    const r2 = await postValidate(STABLE_VALID_PAYLOAD);

    expect(r1.decision).toBe(r2.decision);
    expect(r1.blocking_errors).toEqual(r2.blocking_errors);
    expect(r1.warnings).toEqual(r2.warnings);
    expect(r1.trace).toEqual(r2.trace);
    expect(r1.rule_pack_hash).toBe(r2.rule_pack_hash);
    expect(r1.engine_version).toBe(r2.engine_version);
    expect(r1.rule_pack_version).toBe(r2.rule_pack_version);
    expect(r1.target_profile).toBe(r2.target_profile);
    expect(r1.profile_resolution).toEqual(r2.profile_resolution);
    expect(r1.deterministic_trace).toBe(true);
  });

  it('INVALID decision and violations are identical across two calls', async () => {
    const r1 = await postValidate(STABLE_INVALID_PAYLOAD);
    const r2 = await postValidate(STABLE_INVALID_PAYLOAD);

    expect(r1.decision).toBe('INVALID');
    expect(r2.decision).toBe('INVALID');
    expect(r1.blocking_errors).toEqual(r2.blocking_errors);
    expect(r1.trace).toEqual(r2.trace);
  });

  it('request_id is different on every call (intentionally not deterministic)', async () => {
    const r1 = await postValidate(STABLE_VALID_PAYLOAD);
    const r2 = await postValidate(STABLE_VALID_PAYLOAD);

    expect(r1.request_id).not.toBe(r2.request_id);
  });

  it('deterministic_trace is always true', async () => {
    const r1 = await postValidate(STABLE_VALID_PAYLOAD);
    const r2 = await postValidate(STABLE_INVALID_PAYLOAD);

    expect(r1.deterministic_trace).toBe(true);
    expect(r2.deterministic_trace).toBe(true);
  });

  it('rule_pack_hash is stable across calls', async () => {
    const r1 = await postValidate(STABLE_VALID_PAYLOAD);
    const r2 = await postValidate(STABLE_INVALID_PAYLOAD);

    expect(r1.rule_pack_hash).toBe(r2.rule_pack_hash);
    expect(typeof r1.rule_pack_hash).toBe('string');
    expect(r1.rule_pack_hash.length).toBeGreaterThan(0);
  });

  it('trace covers every rule on every call', async () => {
    const r1 = await postValidate(STABLE_VALID_PAYLOAD);
    const r2 = await postValidate(STABLE_INVALID_PAYLOAD);

    expect(r1.trace.length).toBe(r2.trace.length);
    expect(r1.trace.map((t) => t.rule_id)).toEqual(r2.trace.map((t) => t.rule_id));
  });

  it('violation severity and remediation_hint are stable', async () => {
    const r1 = await postValidate(STABLE_INVALID_PAYLOAD);
    const r2 = await postValidate(STABLE_INVALID_PAYLOAD);

    for (let i = 0; i < r1.blocking_errors.length; i++) {
      expect(r1.blocking_errors[i].severity).toBe(r2.blocking_errors[i].severity);
      expect(r1.blocking_errors[i].remediation_hint).toEqual(r2.blocking_errors[i].remediation_hint);
    }
  });
});

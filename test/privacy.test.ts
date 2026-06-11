import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import app from '../src/index.js';

const TEST_ENV = { VALID_API_KEYS: 'veto-test-key-123' };

const SENSITIVE_INVOICE_NUMBER = 'PRIV-SENSITIVE-INV-XYZ-99999';
const SENSITIVE_AMOUNT = 9876543.21;
const SENSITIVE_SELLER_NAME = 'SensitiveSellerCorpDoNotLog';
const SENSITIVE_BUYER_NAME = 'SensitiveBuyerCorpDoNotLog';

function postValidate(body: unknown) {
  return app.request(
    '/v1/validate',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': 'veto-test-key-123' },
      body: JSON.stringify(body),
    },
    TEST_ENV,
  );
}

describe('Payload privacy — invoice data must not appear in logs', () => {
  let consoleLogs: string[] = [];
  let consoleErrors: string[] = [];

  beforeEach(() => {
    consoleLogs = [];
    consoleErrors = [];
    vi.spyOn(console, 'log').mockImplementation((...args) => {
      consoleLogs.push(JSON.stringify(args));
    });
    vi.spyOn(console, 'error').mockImplementation((...args) => {
      consoleErrors.push(JSON.stringify(args));
    });
    vi.spyOn(console, 'warn').mockImplementation((...args) => {
      consoleLogs.push(JSON.stringify(args));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function assertNotInLogs(value: string) {
    const allLogs = [...consoleLogs, ...consoleErrors].join('\n');
    expect(allLogs).not.toContain(value);
  }

  it('does not log invoice_number on valid request', async () => {
    await postValidate({
      invoice: {
        invoice_number: SENSITIVE_INVOICE_NUMBER,
        issue_date: '2024-01-15',
        seller: { name: SENSITIVE_SELLER_NAME, country: 'DE' },
        buyer: { name: SENSITIVE_BUYER_NAME, country: 'FR' },
        currency: 'EUR',
        total_amount: SENSITIVE_AMOUNT,
      },
      target_profile: 'EN16931',
    });

    assertNotInLogs(SENSITIVE_INVOICE_NUMBER);
    assertNotInLogs(SENSITIVE_SELLER_NAME);
    assertNotInLogs(SENSITIVE_BUYER_NAME);
    assertNotInLogs(String(SENSITIVE_AMOUNT));
  });

  it('does not log invoice_number on invalid request (engine returns INVALID)', async () => {
    await postValidate({
      invoice: {
        invoice_number: SENSITIVE_INVOICE_NUMBER,
        currency: 'EUROS',
      },
      target_profile: 'EN16931',
    });

    assertNotInLogs(SENSITIVE_INVOICE_NUMBER);
  });

  it('does not log invoice fields when auth fails', async () => {
    await app.request(
      '/v1/validate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': 'wrong-key' },
        body: JSON.stringify({
          invoice: { invoice_number: SENSITIVE_INVOICE_NUMBER },
          target_profile: 'EN16931',
        }),
      },
      TEST_ENV,
    );

    assertNotInLogs(SENSITIVE_INVOICE_NUMBER);
  });

  it('does not log invoice fields when content-type is wrong', async () => {
    await app.request(
      '/v1/validate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain', 'X-API-Key': 'veto-test-key-123' },
        body: SENSITIVE_INVOICE_NUMBER,
      },
      TEST_ENV,
    );

    assertNotInLogs(SENSITIVE_INVOICE_NUMBER);
  });

  it('does not log arbitrary extra fields from invoice', async () => {
    const secretField = 'super-secret-vendor-id-do-not-log-12345';
    await postValidate({
      invoice: {
        invoice_number: 'INV-001',
        issue_date: '2024-01-01',
        seller: { country: 'DE' },
        buyer: { country: 'FR' },
        total_amount: 100,
        secret_vendor_field: secretField,
      },
      target_profile: 'EN16931',
    });

    assertNotInLogs(secretField);
  });
});

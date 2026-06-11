import { describe, it, expect } from 'vitest';
import { runEngine } from '../src/rules/engine.js';
import { RULES, evaluateRules } from '../src/rules/rules.js';
import { ENGINE_VERSION, RULE_PACK_VERSION, STORAGE_STATEMENT } from '../src/lib/version.js';

describe('runEngine — structure', () => {
  it('always returns required fields', () => {
    const result = runEngine({}, 'EN16931');
    expect(typeof result.request_id).toBe('string');
    expect(result.request_id.length).toBeGreaterThan(0);
    expect(result.engine_version).toBe(ENGINE_VERSION);
    expect(result.rule_pack_version).toBe(RULE_PACK_VERSION);
    expect(result.storage_statement).toBe(STORAGE_STATEMENT);
    expect(Array.isArray(result.blocking_errors)).toBe(true);
    expect(Array.isArray(result.warnings)).toBe(true);
    expect(Array.isArray(result.trace)).toBe(true);
  });

  it('generates unique request_ids', () => {
    const r1 = runEngine({}, 'EN16931');
    const r2 = runEngine({}, 'EN16931');
    expect(r1.request_id).not.toBe(r2.request_id);
  });
});

describe('runEngine — profile handling', () => {
  it('rejects unknown profile with VT-01 error', () => {
    const result = runEngine({}, 'UNKNOWN');
    expect(result.decision).toBe('INVALID');
    expect(result.blocking_errors[0].rule_id).toBe('VT-01');
    expect(result.trace[0].rule_id).toBe('VT-01');
  });

  it('accepts EN16931', () => {
    const result = runEngine(
      { invoice_number: 'X', issue_date: '2024-01-01', seller: { country: 'DE' }, buyer: { country: 'FR' }, currency: 'EUR', total_amount: 1 },
      'EN16931',
    );
    expect(result.decision).toBe('VALID');
  });

  it('accepts PEPPOL-BIS-3.0', () => {
    const result = runEngine(
      { invoice_number: 'X', issue_date: '2024-01-01', seller: { country: 'DE' }, buyer: { country: 'FR' }, currency: 'EUR', total_amount: 1 },
      'PEPPOL-BIS-3.0',
    );
    expect(result.decision).toBe('VALID');
  });
});

describe('evaluateRules — individual rules', () => {
  it('BR-01 fails when invoice_number is missing', () => {
    const { violations } = evaluateRules({});
    expect(violations.some((v) => v.rule_id === 'BR-01')).toBe(true);
  });

  it('BR-01 fails when invoice_number is empty string', () => {
    const { violations } = evaluateRules({ invoice_number: '  ' });
    expect(violations.some((v) => v.rule_id === 'BR-01')).toBe(true);
  });

  it('BR-01 passes with valid invoice_number', () => {
    const { violations } = evaluateRules({ invoice_number: 'INV-001' });
    expect(violations.some((v) => v.rule_id === 'BR-01')).toBe(false);
  });

  it('BR-02 fails when issue_date is missing', () => {
    const { violations } = evaluateRules({});
    expect(violations.some((v) => v.rule_id === 'BR-02')).toBe(true);
  });

  it('BR-CL-04 passes when currency is absent', () => {
    const { violations } = evaluateRules({ invoice_number: 'X', issue_date: '2024-01-01' });
    expect(violations.some((v) => v.rule_id === 'BR-CL-04')).toBe(false);
  });

  it('BR-CL-04 fails for lowercase currency', () => {
    const { violations } = evaluateRules({ currency: 'eur' });
    expect(violations.some((v) => v.rule_id === 'BR-CL-04')).toBe(true);
  });

  it('BR-CL-04 fails for 4-letter currency', () => {
    const { violations } = evaluateRules({ currency: 'EURO' });
    expect(violations.some((v) => v.rule_id === 'BR-CL-04')).toBe(true);
  });

  it('BR-CL-04 passes for EUR', () => {
    const { violations } = evaluateRules({ currency: 'EUR' });
    expect(violations.some((v) => v.rule_id === 'BR-CL-04')).toBe(false);
  });

  it('BR-DEC-01 produces warning for negative amount', () => {
    const { warnings } = evaluateRules({ total_amount: -1 });
    expect(warnings.some((w) => w.rule_id === 'BR-DEC-01')).toBe(true);
  });

  it('BR-DEC-01 does not warn for zero amount', () => {
    const { warnings } = evaluateRules({ total_amount: 0 });
    expect(warnings.some((w) => w.rule_id === 'BR-DEC-01')).toBe(false);
  });

  it('trace contains entry for every rule', () => {
    const { trace } = evaluateRules({});
    expect(trace.length).toBe(RULES.length);
  });
});

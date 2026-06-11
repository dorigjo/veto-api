/**
 * Compliance-claim guard tests.
 *
 * These tests exist for one reason: prevent any future code change from
 * accidentally removing placeholder signals and silently claiming full
 * EN16931 / PEPPOL BIS / XRechnung compliance.
 *
 * If you are changing a test here because you have compiled official
 * schematron artefacts and updated is_placeholder to false, make sure you
 * have also:
 *   1. Replaced RULE_PACK_HASH with a real artifact SHA-256
 *   2. Updated rules_count to reflect the actual compiled rule count (128+ for EN16931)
 *   3. Passed the official validation test suite (see docs/OFFICIAL_ARTEFACT_SYNC.md)
 *   4. Updated docs/COMPLIANCE_ARCHITECTURE.md and release-status.json
 */

import { describe, it, expect } from 'vitest';
import { RULE_PACK_REGISTRY } from '../src/rules/rule-pack-manifest.js';
import { RULE_PACK_HASH, STORAGE_STATEMENT } from '../src/lib/version.js';
import { SUPPORTED_PROFILES } from '../src/rules/profiles.js';
import { runEngine } from '../src/rules/engine.js';
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

const VALID_INVOICE = {
  invoice_number: 'INV-COMPL-001',
  issue_date: '2024-11-15',
  seller: { name: 'Acme GmbH', country: 'DE' },
  buyer: { name: 'Beta Corp', country: 'FR' },
  currency: 'EUR',
  total_amount: 1190.0,
};

describe('Compliance-claim guards — placeholder signals must be present', () => {
  it('all manifests have is_placeholder: true', () => {
    for (const [profile, manifest] of Object.entries(RULE_PACK_REGISTRY)) {
      expect(
        manifest.is_placeholder,
        `${profile} manifest must have is_placeholder: true until official schematron artefacts are compiled`,
      ).toBe(true);
    }
  });

  it('all manifest artifact_hashes contain PLACEHOLDER sentinel', () => {
    for (const [profile, manifest] of Object.entries(RULE_PACK_REGISTRY)) {
      expect(
        manifest.artifact_hash,
        `${profile} artifact_hash must contain PLACEHOLDER until real schematron hash is computed`,
      ).toMatch(/PLACEHOLDER/);
    }
  });

  it('RULE_PACK_HASH contains PLACEHOLDER sentinel', () => {
    expect(RULE_PACK_HASH).toContain('PLACEHOLDER');
  });

  it('placeholder manifests have rules_count < 50 (guards against false "128 rules" claim)', () => {
    for (const [profile, manifest] of Object.entries(RULE_PACK_REGISTRY)) {
      if (manifest.is_placeholder) {
        expect(
          manifest.rules_count,
          `${profile} is a placeholder but claims ${manifest.rules_count} rules — placeholder packs must declare fewer than 50`,
        ).toBeLessThan(50);
      }
    }
  });

  it('SUPPORTED_PROFILES and RULE_PACK_REGISTRY are in sync', () => {
    const registryKeys = new Set(Object.keys(RULE_PACK_REGISTRY));
    for (const profile of SUPPORTED_PROFILES) {
      expect(
        registryKeys.has(profile),
        `Profile "${profile}" is in SUPPORTED_PROFILES but missing from RULE_PACK_REGISTRY`,
      ).toBe(true);
    }
    expect(Object.keys(RULE_PACK_REGISTRY).length).toBe(SUPPORTED_PROFILES.length);
  });

  it('rule_pack_hash in engine output contains PLACEHOLDER for all profiles', () => {
    for (const profile of SUPPORTED_PROFILES) {
      const result = runEngine(VALID_INVOICE, profile);
      expect(
        result.rule_pack_hash,
        `Engine output for ${profile} must carry PLACEHOLDER hash until official artefacts are integrated`,
      ).toContain('PLACEHOLDER');
    }
  });

  it('profile_resolution.rule_pack_hash contains PLACEHOLDER for all profiles', () => {
    for (const profile of SUPPORTED_PROFILES) {
      const result = runEngine(VALID_INVOICE, profile);
      expect(result.profile_resolution.rule_pack_hash).toContain('PLACEHOLDER');
    }
  });

  it('VALID decision does not mean full EN16931 certified — placeholder hash must be present', async () => {
    const result = await postValidate({
      invoice: VALID_INVOICE,
      target_profile: 'EN16931',
    });
    expect(result.decision).toBe('VALID');
    // A VALID result must still carry the placeholder signal so callers know
    // this passed only 7 placeholder rules, not all 128+ EN16931 rules.
    expect(result.rule_pack_hash).toContain('PLACEHOLDER');
    expect(result.profile_resolution.rule_pack_hash).toContain('PLACEHOLDER');
  });

  it('storage_statement is present and correct in every engine output', () => {
    for (const profile of SUPPORTED_PROFILES) {
      const result = runEngine(VALID_INVOICE, profile);
      expect(result.storage_statement).toBe(STORAGE_STATEMENT);
      expect(result.storage_statement).toContain('No invoice data is stored');
    }
  });

  it('storage_statement is present in every API response', async () => {
    for (const profile of SUPPORTED_PROFILES) {
      const result = await postValidate({ invoice: VALID_INVOICE, target_profile: profile });
      expect(result.storage_statement).toBe(STORAGE_STATEMENT);
    }
  });

  it('deterministic_trace is always true (same input, same output guarantee)', () => {
    for (const profile of SUPPORTED_PROFILES) {
      const result = runEngine(VALID_INVOICE, profile);
      expect(result.deterministic_trace).toBe(true);
    }
  });

  it('unsupported profile returns INVALID with placeholder hash — no compliance implied', () => {
    const result = runEngine(VALID_INVOICE, 'FAKE-PROFILE-X');
    expect(result.decision).toBe('INVALID');
    expect(result.rule_pack_hash).toContain('PLACEHOLDER');
  });
});

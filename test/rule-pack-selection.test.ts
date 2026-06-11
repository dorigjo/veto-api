import { describe, it, expect } from 'vitest';
import { selectRulePack } from '../src/rules/profile-selector.js';
import { runEngine } from '../src/rules/engine.js';
import { RULE_PACK_REGISTRY } from '../src/rules/rule-pack-manifest.js';

describe('selectRulePack — profile resolution', () => {
  it('resolves EN16931 to correct manifest', () => {
    const resolution = selectRulePack('EN16931');
    expect(resolution.requested).toBe('EN16931');
    expect(resolution.resolved).toBe('EN16931');
    expect(resolution.rule_pack_id).toBe('en16931-2024.1');
    expect(resolution.is_cius).toBe(false);
    expect(resolution.base_standard).toBe('EN16931');
  });

  it('resolves PEPPOL-BIS-3.0 to correct manifest', () => {
    const resolution = selectRulePack('PEPPOL-BIS-3.0');
    expect(resolution.requested).toBe('PEPPOL-BIS-3.0');
    expect(resolution.resolved).toBe('PEPPOL-BIS-3.0');
    expect(resolution.rule_pack_id).toBe('peppol-bis-3.0-2024.1');
    expect(resolution.is_cius).toBe(true);
    expect(resolution.base_standard).toBe('EN16931');
  });

  it('resolves XRECHNUNG-3.0 to correct manifest', () => {
    const resolution = selectRulePack('XRECHNUNG-3.0');
    expect(resolution.requested).toBe('XRECHNUNG-3.0');
    expect(resolution.resolved).toBe('XRECHNUNG-3.0');
    expect(resolution.rule_pack_id).toBe('xrechnung-3.0-2024.1');
    expect(resolution.is_cius).toBe(true);
    expect(resolution.base_standard).toBe('EN16931');
  });

  it('returns none resolution for unknown profile', () => {
    const resolution = selectRulePack('UNKNOWN-PROFILE');
    expect(resolution.rule_pack_id).toBe('none');
    expect(resolution.rule_pack_hash).toBe('none');
    expect(resolution.base_standard).toBe('unknown');
  });

  it('returns none resolution for empty string profile', () => {
    const resolution = selectRulePack('');
    expect(resolution.rule_pack_id).toBe('none');
  });

  it('all manifests in registry have required fields', () => {
    for (const [profile, manifest] of Object.entries(RULE_PACK_REGISTRY)) {
      expect(manifest.rule_pack_id, `${profile} missing rule_pack_id`).toBeTruthy();
      expect(manifest.standard, `${profile} missing standard`).toBeTruthy();
      expect(manifest.source, `${profile} missing source`).toBeTruthy();
      expect(manifest.source_url, `${profile} missing source_url`).toBeTruthy();
      expect(manifest.version, `${profile} missing version`).toBeTruthy();
      expect(manifest.artifact_hash, `${profile} missing artifact_hash`).toBeTruthy();
      expect(typeof manifest.rules_count, `${profile} rules_count must be number`).toBe('number');
      expect(manifest.rules_count, `${profile} must have at least 1 rule`).toBeGreaterThan(0);
    }
  });
});

describe('runEngine — XRechnung-3.0 profile', () => {
  const validInvoice = {
    invoice_number: 'XRECH-001',
    issue_date: '2024-11-15',
    seller: { name: 'DE GmbH', country: 'DE' },
    buyer: { name: 'Bundesamt', country: 'DE' },
    currency: 'EUR',
    total_amount: 500.0,
  };

  it('accepts XRECHNUNG-3.0 as valid profile', () => {
    const result = runEngine(validInvoice, 'XRECHNUNG-3.0');
    expect(result.decision).toBe('VALID');
    expect(result.target_profile).toBe('XRECHNUNG-3.0');
  });

  it('profile_resolution reflects CIUS status for XRECHNUNG-3.0', () => {
    const result = runEngine(validInvoice, 'XRECHNUNG-3.0');
    expect(result.profile_resolution.is_cius).toBe(true);
    expect(result.profile_resolution.base_standard).toBe('EN16931');
    expect(result.profile_resolution.rule_pack_id).toBe('xrechnung-3.0-2024.1');
  });

  it('returns INVALID for unsupported profile with VT-01 and unsupported_profile hint', () => {
    const result = runEngine({}, 'NONEXISTENT-PROFILE');
    expect(result.decision).toBe('INVALID');
    const err = result.blocking_errors[0];
    expect(err.rule_id).toBe('VT-01');
    expect(err.severity).toBe('error');
    expect(err.remediation_hint?.hint_type).toBe('unsupported_profile');
  });
});

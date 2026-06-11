#!/usr/bin/env tsx
/**
 * Generates release-status.json from the current source state.
 * Run with: npm run status:generate
 * Commit the output — it is the machine-readable contract for release readiness.
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';

// Mirror constants from src/ to avoid CF Workers type conflicts in this script context
const ENGINE_VERSION = '0.2.0';
const RULE_PACK_VERSION = '2024.1';
const RULE_PACK_HASH = 'sha256-PLACEHOLDER-2024.1-7rules';

const SUPPORTED_PROFILES = ['EN16931', 'PEPPOL-BIS-3.0', 'XRECHNUNG-3.0'];

const MANIFEST_META = {
  'EN16931': {
    rules_count: 7,
    is_placeholder: true,
    official_schematron_url: 'https://github.com/ConnectingEurope/eInvoicing-EN16931',
    rules_required_full_compliance: 128,
    source: 'CEN/TC 434 EN 16931-1:2017',
  },
  'PEPPOL-BIS-3.0': {
    rules_count: 7,
    is_placeholder: true,
    official_schematron_url: 'https://github.com/OpenPEPPOL/peppol-bis-invoice-3',
    rules_required_full_compliance: 150, // EN16931 base + PEPPOL CIUS rules
    source: 'OpenPEPPOL PEPPOL BIS Billing 3.0',
  },
  'XRECHNUNG-3.0': {
    rules_count: 7,
    is_placeholder: true,
    official_schematron_url: 'https://github.com/itplr-kosit/validator-configuration-xrechnung',
    rules_required_full_compliance: 170, // EN16931 base + XRechnung CIUS rules
    source: 'KoSIT XRechnung 3.0 CIUS',
  },
} as const;

const status = {
  schema_version: '1.0',
  generated_at: new Date().toISOString(),
  veto_version: ENGINE_VERSION,
  rule_pack_version: RULE_PACK_VERSION,
  rule_pack_hash: RULE_PACK_HASH,
  supported_profiles: SUPPORTED_PROFILES,

  readiness: {
    developer_preview: true,
    paid_beta: false,
    production_compliance: false,
    cloudflare_deploy: true,
    self_serve_saas: false,
  },

  compliance: Object.fromEntries(
    Object.entries(MANIFEST_META).map(([profile, meta]) => [
      profile,
      {
        profile,
        is_placeholder: meta.is_placeholder,
        rules_implemented: meta.rules_count,
        rules_required_for_full_compliance: meta.rules_required_full_compliance,
        official_schematron_integrated: false,
        source: meta.source,
        official_schematron_url: meta.official_schematron_url,
        blocker: 'Official schematron artefacts not yet compiled. See docs/OFFICIAL_ARTEFACT_SYNC.md.',
      },
    ])
  ),

  infrastructure: {
    rate_limiting: {
      middleware_implemented: true,
      binding_configured: false,
      graceful_degradation: true,
      blocker: 'RATE_LIMITER binding must be added to wrangler.toml and Cloudflare dashboard. See docs/RATE_LIMITING.md.',
    },
    api_key_provisioning: {
      mode: 'manual',
      self_serve: false,
      kv_store_integrated: false,
      blocker: 'Stripe + Cloudflare KV integration required for self-serve provisioning. See docs/API_KEY_PROVISIONING.md.',
    },
    billing: {
      stripe_integrated: false,
      metered_billing: false,
      blocker: 'Stripe webhook handler and metered billing not implemented. See docs/BILLING_ARCHITECTURE.md.',
    },
    secrets: {
      api_keys_in_vars: true,
      wrangler_secret_configured: false,
      blocker: 'VALID_API_KEYS must be migrated to wrangler secret put before production deployment. See docs/PRODUCTION_SECRETS.md.',
    },
  },

  blockers: [
    {
      id: 'BLK-01',
      severity: 'CRITICAL',
      category: 'compliance',
      title: 'EN16931 schematron not integrated',
      description: 'Only 7 of 128+ EN16931 rules implemented. Official CEN/TC 434 schematron artefacts must be compiled.',
      blocks: ['production_compliance', 'paid_beta'],
    },
    {
      id: 'BLK-02',
      severity: 'CRITICAL',
      category: 'compliance',
      title: 'PEPPOL BIS 3.0 schematron not integrated',
      description: 'PEPPOL-specific rules (network IDs, GLN, routing) not implemented. Only 7 shared base rules active.',
      blocks: ['production_compliance'],
    },
    {
      id: 'BLK-03',
      severity: 'CRITICAL',
      category: 'compliance',
      title: 'XRechnung 3.0 CIUS not integrated',
      description: 'XRechnung-specific rules (Leitweg-ID, German B2G requirements) not implemented.',
      blocks: ['production_compliance'],
    },
    {
      id: 'BLK-04',
      severity: 'HIGH',
      category: 'infrastructure',
      title: 'Rate limiting binding not configured',
      description: 'RATE_LIMITER binding absent — any valid API key can make unlimited requests.',
      blocks: ['paid_beta', 'self_serve_saas'],
    },
    {
      id: 'BLK-05',
      severity: 'HIGH',
      category: 'infrastructure',
      title: 'No metered billing',
      description: 'No Stripe integration — cannot collect revenue or enforce usage caps.',
      blocks: ['paid_beta', 'self_serve_saas'],
    },
    {
      id: 'BLK-06',
      severity: 'HIGH',
      category: 'infrastructure',
      title: 'Manual API key provisioning only',
      description: 'Self-serve signup not possible — keys issued manually.',
      blocks: ['self_serve_saas'],
    },
    {
      id: 'BLK-07',
      severity: 'MEDIUM',
      category: 'secrets',
      title: 'VALID_API_KEYS in wrangler.toml [vars]',
      description: 'Dev placeholder in committed [vars]. Must use wrangler secret put before production.',
      blocks: ['cloudflare_deploy_production_safe'],
    },
  ],

  go_no_go: {
    developer_preview: 'GO',
    paid_beta: 'NO_GO',
    production_compliance: 'NO_GO',
    cloudflare_deploy: 'CONDITIONAL_GO — set VALID_API_KEYS via wrangler secret put first',
    self_serve_saas: 'NO_GO',
  },
};

const outputPath = resolve('release-status.json');
writeFileSync(outputPath, JSON.stringify(status, null, 2) + '\n');
console.log(`release-status.json generated at ${outputPath}`);

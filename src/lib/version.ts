export const ENGINE_VERSION = '0.2.0';
export const RULE_PACK_VERSION = '2024.1';

// Deterministic identifier for current rule pack contents.
// Format: sha256-PLACEHOLDER-<version>-<rules_count>
// This will be replaced with a real cryptographic hash once official
// schematron artefacts are ingested via scripts/rules/compile-rule-pack.ts
export const RULE_PACK_HASH = 'sha256-PLACEHOLDER-2024.1-7rules';

export const STORAGE_STATEMENT =
  'No invoice data is stored or logged by this service.';

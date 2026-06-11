#!/usr/bin/env tsx
/**
 * Lightweight OpenAPI spec structural validator.
 * No external YAML parser required — uses regex over the raw spec text.
 * Fails CI if required structural elements are missing.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const SPEC_PATH = resolve('openapi/openapi.yaml');

if (!existsSync(SPEC_PATH)) {
  console.error(`ERROR: OpenAPI spec not found at ${SPEC_PATH}`);
  process.exit(1);
}

const content = readFileSync(SPEC_PATH, 'utf-8');

const checks: Array<{ name: string; pattern: RegExp }> = [
  { name: 'OpenAPI 3.x declaration', pattern: /^openapi:\s*['"]?3\./m },
  { name: 'info block present', pattern: /^info:/m },
  { name: 'title field present', pattern: /title:/m },
  { name: 'version field present', pattern: /version:/m },
  { name: 'paths block present', pattern: /^paths:/m },
  { name: 'GET /v1/health endpoint', pattern: /\/v1\/health:/ },
  { name: 'GET /v1/version endpoint', pattern: /\/v1\/version:/ },
  { name: 'POST /v1/validate endpoint', pattern: /\/v1\/validate:/ },
  { name: 'SecuritySchemes defined', pattern: /securitySchemes:/ },
  { name: 'ValidationResponse schema', pattern: /ValidationResponse:/ },
  { name: 'RuleViolation schema', pattern: /RuleViolation:/ },
  { name: 'ErrorResponse schema', pattern: /ErrorResponse:/ },
  { name: 'ProfileResolution schema', pattern: /ProfileResolution:/ },
  { name: 'RemediationHint schema', pattern: /RemediationHint:/ },
  { name: '401 response documented', pattern: /"?401"?:/ },
  { name: '400 response documented', pattern: /"?400"?:/ },
];

let passed = 0;
let failed = 0;

for (const check of checks) {
  if (check.pattern.test(content)) {
    console.log(`  ✓ ${check.name}`);
    passed++;
  } else {
    console.error(`  ✗ ${check.name}`);
    failed++;
  }
}

console.log('');
if (failed > 0) {
  console.error(`OpenAPI check FAILED: ${failed}/${checks.length} checks failed`);
  process.exit(1);
}

console.log(`OpenAPI check PASSED: ${passed}/${checks.length} checks passed`);

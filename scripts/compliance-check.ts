#!/usr/bin/env tsx
/**
 * Compliance claim guard — static check of placeholder signals.
 * Runs as part of release:check to prevent accidental false compliance claims.
 * Fails CI if any manifest has is_placeholder removed without meeting all pre-conditions.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const MANIFEST_PATH = resolve('src/rules/rule-pack-manifest.ts');
const VERSION_PATH = resolve('src/lib/version.ts');
const RELEASE_STATUS_PATH = resolve('release-status.json');

let passed = 0;
let failed = 0;

function check(name: string, condition: boolean, hint: string): void {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.error(`  ✗ ${name}`);
    console.error(`    → ${hint}`);
    failed++;
  }
}

const manifest = readFileSync(MANIFEST_PATH, 'utf-8');
const version = readFileSync(VERSION_PATH, 'utf-8');

// 1. All manifests must have is_placeholder: true
// Match only value assignments (comma-terminated), not the TypeScript type declaration (`is_placeholder: boolean;`)
const isPlaceholderInstances = (manifest.match(/is_placeholder:\s*(?:true|false),/g) ?? []).length;
const trueInstances = (manifest.match(/is_placeholder:\s*true,/g) ?? []).length;
check(
  'All rule pack manifests have is_placeholder: true',
  isPlaceholderInstances > 0 && isPlaceholderInstances === trueInstances,
  'Set is_placeholder: true on all manifests, or complete the schematron integration steps in docs/OFFICIAL_ARTEFACT_SYNC.md',
);

// 2. All artifact hashes must contain PLACEHOLDER
// Match only string-value assignments (not the TypeScript `artifact_hash: string;` declaration)
const hashInstances = (manifest.match(/artifact_hash:\s*['"]/g) ?? []).length;
const placeholderHashInstances = (manifest.match(/artifact_hash:\s*['"].*PLACEHOLDER/g) ?? []).length;
check(
  'All artifact_hash values contain PLACEHOLDER sentinel',
  hashInstances > 0 && hashInstances === placeholderHashInstances,
  'Replace non-placeholder hashes only after running scripts/rules/compile-rule-pack.ts with verified official artefacts',
);

// 3. RULE_PACK_HASH must contain PLACEHOLDER
check(
  'RULE_PACK_HASH in version.ts contains PLACEHOLDER',
  /RULE_PACK_HASH\s*=\s*['"].*PLACEHOLDER/.test(version),
  'Update RULE_PACK_HASH only after official schematron artefacts are compiled and verified',
);

// 4. No manifest claims rules_count >= 50 while is_placeholder is true
const manifestBlocks = manifest.match(/\{[\s\S]*?\}/g) ?? [];
for (const block of manifestBlocks) {
  if (!/is_placeholder:\s*true/.test(block)) continue;
  const countMatch = block.match(/rules_count:\s*(\d+)/);
  if (countMatch) {
    const count = parseInt(countMatch[1], 10);
    check(
      `Placeholder manifest does not falsely claim ${count} rules (must be < 50)`,
      count < 50,
      'Placeholder rule packs must not claim >= 50 rules. Only set high rules_count after official artefact integration.',
    );
  }
}

// 5. release-status.json exists and is parseable
let releaseStatusOk = false;
try {
  const status = JSON.parse(readFileSync(RELEASE_STATUS_PATH, 'utf-8'));
  releaseStatusOk =
    typeof status.veto_version === 'string' &&
    typeof status.readiness === 'object' &&
    typeof status.go_no_go === 'object';
} catch {
  // file missing or invalid JSON
}
check(
  'release-status.json exists and is valid',
  releaseStatusOk,
  'Run: npm run status:generate',
);

console.log('');
if (failed > 0) {
  console.error(`Compliance check FAILED: ${failed}/${passed + failed} checks failed`);
  process.exit(1);
}
console.log(`Compliance check PASSED: ${passed}/${passed + failed} checks passed`);

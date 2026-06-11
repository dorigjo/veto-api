#!/usr/bin/env tsx
/**
 * verify-rule-pack.ts
 *
 * Verifies that compiled rule packs produce correct decisions against
 * known-good and known-bad invoice fixtures.
 *
 * Run after compile-rule-pack.ts to catch regressions before deployment.
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve } from 'path';

interface Fixture {
  name: string;
  profile: string;
  invoice: Record<string, unknown>;
  expected_decision: 'VALID' | 'INVALID' | 'WARNING';
  expected_rule_ids?: string[];
}

const FIXTURES_DIR = resolve('rules/fixtures');

function loadFixtures(): Fixture[] {
  if (!existsSync(FIXTURES_DIR)) {
    console.error(`ERROR: rules/fixtures/ not found`);
    process.exit(1);
  }

  const files = readdirSync(FIXTURES_DIR).filter((f) => f.endsWith('.json'));
  return files.map((file) => {
    const content = readFileSync(resolve(FIXTURES_DIR, file), 'utf-8');
    return JSON.parse(content) as Fixture;
  });
}

async function runVerification(): Promise<void> {
  const fixtures = loadFixtures();
  console.log(`Verifying ${fixtures.length} fixtures against rule packs...\n`);

  // Dynamic import so this works after compile-rule-pack generates the modules
  const { runEngine } = await import('../../src/rules/engine.js');

  let passed = 0;
  let failed = 0;

  for (const fixture of fixtures) {
    const result = runEngine(fixture.invoice as never, fixture.profile);

    const decisionMatch = result.decision === fixture.expected_decision;
    const ruleMatch =
      !fixture.expected_rule_ids ||
      fixture.expected_rule_ids.every((id) =>
        [...result.blocking_errors, ...result.warnings].some((v) => v.rule_id === id),
      );

    if (decisionMatch && ruleMatch) {
      console.log(`  ✓ ${fixture.name} (${fixture.profile}) → ${result.decision}`);
      passed++;
    } else {
      console.error(`  ✗ ${fixture.name} (${fixture.profile})`);
      console.error(`    expected: ${fixture.expected_decision}, got: ${result.decision}`);
      if (!ruleMatch) {
        console.error(`    expected rule IDs: ${fixture.expected_rule_ids?.join(', ')}`);
        console.error(
          `    actual violations: ${[...result.blocking_errors, ...result.warnings].map((v) => v.rule_id).join(', ')}`,
        );
      }
      failed++;
    }
  }

  console.log('');
  if (failed > 0) {
    console.error(`Rule pack verification FAILED: ${failed}/${fixtures.length} fixtures failed`);
    process.exit(1);
  }

  console.log(`Rule pack verification PASSED: ${passed}/${fixtures.length} fixtures passed`);
}

runVerification().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});

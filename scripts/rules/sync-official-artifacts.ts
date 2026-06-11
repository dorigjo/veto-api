#!/usr/bin/env tsx
/**
 * sync-official-artifacts.ts
 *
 * Downloads official schematron artefacts from authoritative sources into rules/sources/.
 * Run manually before running compile-rule-pack.ts.
 *
 * Sources:
 *   EN16931:       https://github.com/ConnectingEurope/eInvoicing-EN16931/releases
 *   PEPPOL BIS:    https://github.com/OpenPEPPOL/peppol-bis-invoice-3/releases
 *   XRechnung:     https://github.com/itplr-kosit/validator-configuration-xrechnung/releases
 *
 * STATUS: SCAFFOLD — download logic not yet implemented.
 * This file establishes the architecture; implementation follows once official
 * artifact URLs are pinned and verified.
 */

interface ArtifactSource {
  id: string;
  profile: string;
  release_url: string;
  expected_files: string[];
}

const SOURCES: ArtifactSource[] = [
  {
    id: 'en16931',
    profile: 'EN16931',
    release_url: 'https://github.com/ConnectingEurope/eInvoicing-EN16931/releases',
    expected_files: ['EN16931-UBL-model.sch', 'EN16931-CII-model.sch'],
  },
  {
    id: 'peppol-bis-3',
    profile: 'PEPPOL-BIS-3.0',
    release_url: 'https://github.com/OpenPEPPOL/peppol-bis-invoice-3/releases',
    expected_files: ['PEPPOL-EN16931-UBL.sch', 'PEPPOL-EN16931-CII.sch'],
  },
  {
    id: 'xrechnung-3',
    profile: 'XRECHNUNG-3.0',
    release_url:
      'https://github.com/itplr-kosit/validator-configuration-xrechnung/releases',
    expected_files: ['xrechnung-ubl-validation.sch', 'xrechnung-cii-validation.sch'],
  },
];

console.log('Artifact sync — SCAFFOLD (not yet implemented)');
console.log('');
console.log('Official sources to sync:');
for (const src of SOURCES) {
  console.log(`  [${src.id}] ${src.profile}`);
  console.log(`    URL: ${src.release_url}`);
  console.log(`    Expected: ${src.expected_files.join(', ')}`);
}
console.log('');
console.log('Implementation required:');
console.log('  1. Pin specific release tags for each source');
console.log('  2. Download artefacts to rules/sources/<id>/');
console.log('  3. Compute SHA256 hash of each downloaded file');
console.log('  4. Write manifest.json with version + hash');
console.log('  5. Run compile-rule-pack.ts to generate TypeScript rule modules');

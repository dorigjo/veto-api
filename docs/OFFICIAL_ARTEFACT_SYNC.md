# Official Artefact Sync

**Status:** Not started  
**Blocks:** BLK-01, BLK-02, BLK-03

This document describes the architecture and step-by-step process for downloading, verifying, and compiling official EN16931, PEPPOL BIS 3.0, and XRechnung 3.0 schematron artefacts into the VETO rule engine.

---

## Why This Matters

The current rule packs are hand-coded approximations. They catch obvious structural errors (missing fields, bad currency codes) but miss 120+ semantic rules defined by the official standards bodies. Claiming compliance without official artefacts is a fraud risk for customers and a reputational risk for VETO.

---

## Official Artefact Sources

| Standard | Maintainer | Repository | Release cadence |
|---|---|---|---|
| EN16931 | CEN/TC 434 | github.com/ConnectingEurope/eInvoicing-EN16931 | ~1–2/year |
| PEPPOL BIS 3.0 | OpenPEPPOL | github.com/OpenPEPPOL/peppol-bis-invoice-3 | Quarterly |
| XRechnung 3.0 | KoSIT | github.com/itplr-kosit/validator-configuration-xrechnung | ~2/year |

**Do not download artefacts from any other source.** Use the GitHub releases page for each repository and verify the SHA-256 of each downloaded file.

---

## Integration Architecture

```
Official GitHub Release (.sch files)
    │
    ▼
scripts/rules/download-artefacts.ts
    ├── Download .sch files from GitHub releases API
    ├── Verify SHA-256 against published hash in release notes
    └── Write to rules/artefacts/{standard}/{version}/

scripts/rules/compile-rule-pack.ts
    ├── Parse Schematron (ISO:Schematron 2016 XML, XPath predicates)
    ├── Convert each <assert> / <report> to a TypeScript rule function
    ├── Generate rules/{standard}/compiled-rules.ts
    ├── Compute SHA-256 of generated file
    └── Update src/rules/rule-pack-manifest.ts
            - artifact_hash = real SHA-256
            - is_placeholder = false
            - rules_count = actual count

scripts/rules/verify-rule-pack.ts
    ├── Run compiled rules against official test fixtures
    ├── Compare results against official expected output
    └── Fail CI if any mismatch
```

---

## Step-by-Step: First Integration (EN16931)

1. **Pin the target release**  
   ```
   EN16931 version: 1.3.13 (2024-10-01)
   UBL schematron: EN16931-UBL-validation.sch
   CII schematron: EN16931-CII-validation.sch
   ```

2. **Download and verify**  
   ```sh
   # Run from repo root
   npx tsx scripts/rules/download-artefacts.ts \
     --standard EN16931 \
     --version 1.3.13 \
     --output rules/artefacts/EN16931/1.3.13/
   ```
   The script must reject any download where the SHA-256 does not match the published hash.

3. **Compile to TypeScript**  
   ```sh
   npx tsx scripts/rules/compile-rule-pack.ts \
     --input rules/artefacts/EN16931/1.3.13/EN16931-UBL-validation.sch \
     --output src/rules/compiled/en16931-rules.ts \
     --manifest src/rules/rule-pack-manifest.ts
   ```
   Output: one TypeScript function per Schematron `<assert>` / `<report>`.

4. **Run official validation test suite**  
   ```sh
   npm run test:compliance -- --suite EN16931
   ```
   All official test fixtures from `eInvoicing-EN16931/syntax/UBL/validation/` must pass.

5. **Update manifest**  
   After step 3 succeeds, the compile script sets:
   ```typescript
   is_placeholder: false,
   artifact_hash: 'sha256-<real-hash>',
   rules_count: 134, // actual number of compiled rules
   ```

6. **Update RULE_PACK_HASH in version.ts**  
   Set to the hash of the compiled rule pack bundle, not the schematron source.

7. **Run `npm run release:check`** — must pass

8. **Commit**:
   ```
   rules: integrate official EN16931 1.3.13 artefacts (134 rules, sha256-<hash>)
   ```

---

## Cloudflare Workers Constraint

Official schematron artefacts are Schematron XML with XPath 2.0 predicates. Cloudflare Workers V8 isolates do not support:
- Node.js `child_process` (cannot run Saxon or Xalan)
- Native DOM/XPath parsers

**Resolution:** Compile schematron to TypeScript at build time (not at request time). Each `<assert>` becomes a pure TypeScript function that operates on the parsed JSON representation of the invoice. This is exactly what `scripts/rules/compile-rule-pack.ts` does.

See [SCHEMATRON_DECISION_RECORD.md](SCHEMATRON_DECISION_RECORD.md) for the full architecture decision.

---

## Hash Verification Policy

- All downloaded artefacts must have their SHA-256 recorded in `rules/artefacts/{standard}/{version}/manifest.json`
- The `artifact_hash` in `RulePackManifest` must match the hash of the **compiled TypeScript output**, not the source `.sch` file
- CI must verify hash stability — the same source must always produce the same compiled output

---

## Quarterly Update Process

1. Watch OpenPEPPOL and KoSIT GitHub repositories for new releases
2. Run `npm run artefacts:check` (compares current vs. latest published version)
3. Re-run the integration steps above for each updated standard
4. Update `RULE_PACK_VERSION` in `version.ts` (format: `YYYY.N`)
5. Regenerate `release-status.json` via `npm run status:generate`
6. Commit and deploy

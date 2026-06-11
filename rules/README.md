# VETO Rule Pack Directory

This directory contains the artifact management structure for official e-invoicing validation rule packs.

## Directory Layout

```
rules/
├── sources/          Official schematron artefacts (downloaded by sync-official-artifacts.ts)
├── generated/        Compiled TypeScript rule modules (output of compile-rule-pack.ts)
├── fixtures/         Known-good and known-bad invoice fixtures for regression testing
└── README.md         This file
```

## Status

| Profile | Source | Status |
|---------|--------|--------|
| EN16931 | CEN/TC 434 | PLACEHOLDER — hand-coded approximation |
| PEPPOL-BIS-3.0 | OpenPEPPOL | PLACEHOLDER — applies EN16931 base rules |
| XRECHNUNG-3.0 | KoSIT | PLACEHOLDER — applies EN16931 base rules |

**None of these rule packs have been validated against official schematron artefacts yet.**
See `docs/COMPLIANCE_DISCLAIMER.md` for the full statement.

## To implement real compliance

1. Run `npm run scripts/rules/sync-official-artifacts.ts` to download official artefacts into `rules/sources/`
2. Run `npm run scripts/rules/compile-rule-pack.ts` to generate TypeScript modules into `rules/generated/`
3. Run `npm run scripts/rules/verify-rule-pack.ts` to verify fixtures pass
4. Update `src/rules/rule-pack-manifest.ts` with the real `artifact_hash`
5. Update `src/lib/version.ts` RULE_PACK_HASH

## Official Sources

| Profile | Authority | Repository |
|---------|-----------|------------|
| EN16931 | CEN/TC 434 | https://github.com/ConnectingEurope/eInvoicing-EN16931 |
| PEPPOL BIS 3.0 | OpenPEPPOL | https://github.com/OpenPEPPOL/peppol-bis-invoice-3 |
| XRechnung 3.0 | KoSIT | https://github.com/itplr-kosit/validator-configuration-xrechnung |

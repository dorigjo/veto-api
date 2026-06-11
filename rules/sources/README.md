# Official Schematron Sources

This directory holds official schematron artefacts downloaded from authoritative sources.

**Contents are gitignored** — artefacts are large and change with each release.  
Run `tsx scripts/rules/sync-official-artifacts.ts` to populate this directory.

Each profile gets its own subdirectory:

```
sources/
├── en16931/
│   ├── manifest.json          (version, hash, download_date)
│   ├── EN16931-UBL-model.sch
│   └── EN16931-CII-model.sch
├── peppol-bis-3/
│   ├── manifest.json
│   ├── PEPPOL-EN16931-UBL.sch
│   └── PEPPOL-EN16931-CII.sch
└── xrechnung-3/
    ├── manifest.json
    ├── xrechnung-ubl-validation.sch
    └── xrechnung-cii-validation.sch
```

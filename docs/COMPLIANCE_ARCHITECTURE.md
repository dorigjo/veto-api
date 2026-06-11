# VETO Compliance Architecture

## What is real today

### Implemented (placeholder rules)

VETO currently evaluates 7 hand-coded rules against the invoice JSON payload:

| Rule ID | Field | Check |
|---------|-------|-------|
| BR-01 | invoice_number | Present and non-empty |
| BR-02 | issue_date | Present and non-empty |
| BR-04 | seller.country | Present and non-empty |
| BR-07 | buyer.country | Present and non-empty |
| BR-09 | total_amount | Present and finite number |
| BR-CL-04 | currency | If present, matches /^[A-Z]{3}$/ |
| BR-DEC-01 | total_amount | If present, is non-negative (warning) |

These rules are deterministic and correctly reject obviously malformed invoices. They do NOT implement the full EN16931 rule set.

### What these rules do NOT implement

EN16931-1:2017 contains 128 mandatory business rules (BR-xx), 40 conditional rules (BR-CO-xx, BR-E-xx, etc.), and 22 code list rules (BR-CL-xx). The current 7 rules cover approximately 5% of mandatory validation.

Missing categories include:
- VAT category and rate validation
- Tax point date rules
- Allowance/charge calculation consistency
- Document-level tax calculation (BR-CO-14 to BR-CO-25)
- Line-level tax consistency
- Payment terms validation
- UBL 2.1 / CII D16B structural rules
- PEPPOL network identifier rules (GLN, OIN, DUNS)
- XRechnung CIUS-specific mandatory extensions

---

## What is placeholder

All three currently supported profiles use the same 7 base rules. There is NO profile-specific rule differentiation yet:

- `EN16931` → 7 base rules (placeholder)
- `PEPPOL-BIS-3.0` → same 7 base rules (placeholder; should have ~200 PEPPOL-specific additional checks)
- `XRECHNUNG-3.0` → same 7 base rules (placeholder; should have ~50 XRechnung CIUS-specific checks)

The `rule_pack_hash` in all responses contains `PLACEHOLDER` in the string — this is an intentional signal to API consumers.

---

## What must use official artefacts

The following must NOT be hand-coded. They must be derived from official schematron artefacts:

| Standard | Authority | Official Artefact |
|----------|-----------|-------------------|
| EN16931 | CEN/TC 434 | EN16931-UBL-model.sch, EN16931-CII-model.sch |
| PEPPOL BIS 3.0 | OpenPEPPOL | PEPPOL-EN16931-UBL.sch, PEPPOL-EN16931-CII.sch |
| XRechnung 3.0 | KoSIT | xrechnung-ubl-validation.sch, xrechnung-cii-validation.sch |

See `docs/OFFICIAL_SOURCES.md` for download locations.

---

## Why LLMs are forbidden in runtime compliance decisions

1. **Non-determinism.** LLM outputs are probabilistic. Tax authorities require deterministic, auditable rule evaluation.
2. **No authoritative source.** An LLM cannot be the source of truth for whether a specific XPath predicate in a schematron rule passes or fails.
3. **Latency and cost.** LLM inference adds 500–2000ms and significant compute cost per validation. Invoice validation must be cheap and fast.
4. **Hallucination risk.** An LLM may report a valid invoice as invalid (or vice versa) with no detectable failure mode.
5. **No audit trail.** LLM reasoning cannot be independently reproduced or certified by a standards body.

**LLMs are allowed for:** rule pack research, test fixture generation, documentation generation, support draft writing, spec monitoring (offline/build-time only).

---

## How official rule packs will be versioned

Each rule pack has a `RulePackManifest` with:
- `version` — the upstream release tag (e.g., "3.0.13" for XRechnung)
- `artifact_hash` — SHA256 of the compiled rule module
- `generated_at` — ISO timestamp of compilation
- `is_placeholder` — true until real schematron is compiled

`RULE_PACK_HASH` in `src/lib/version.ts` is the hash of the currently deployed rule pack. Any change to rules changes this hash, which appears in every API response, allowing consumers to detect unexpected rule pack updates.

---

## Compliance roadmap

| Version | Deliverable |
|---------|-------------|
| v0.2 | Full EN16931 mandatory rules (BR-01 through BR-28, BR-CO-xx, BR-CL-xx) |
| v0.3 | PEPPOL BIS Billing 3.0 rules compiled from OpenPEPPOL schematron |
| v0.5 | XRechnung 3.0 CIUS compiled from KoSIT schematron |
| v1.0 | All three profiles validated against official golden test fixtures |

---

## Runtime architecture (target state)

```
POST /v1/validate
  │
  ├── Parse + Zod schema validation
  ├── Profile resolution → select RulePackManifest
  ├── Load compiled TypeScript rule module (from rules/generated/)
  ├── Execute rule evaluator (deterministic, no I/O)
  ├── Collect violations + trace
  └── Return ValidationResponse (never store, never log payload)
```

The key constraint: **no external calls at runtime**. All rule logic is compiled into the Worker bundle at deploy time.

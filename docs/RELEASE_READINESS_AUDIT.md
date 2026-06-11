# VETO Release-Readiness Audit

**Date:** 2026-06-11  
**Auditor:** CTO/Infrastructure review  
**Commit:** 1ab7be0  
**Verdict:** NOT release-ready for production compliance use. Developer preview only.

---

## Scores

| Area | Score | Gap |
|------|-------|-----|
| GitHub repo hygiene | 35/100 | No CI, no workflows, no branch protection, no CODEOWNERS, no PR/issue templates |
| Architecture | 72/100 | Good stateless skeleton; missing rule-pack abstraction layer, no artifact ingestion path |
| Statelessness | 92/100 | Excellent — in-memory only, no storage bindings, storage statement in every response |
| API design | 62/100 | Solid skeleton; missing stable error codes, remediation hints, rule_pack_hash, profile_resolution |
| Auth/security | 55/100 | API key auth works; no rate limiting, no request size limit, no content-type enforcement |
| Tests | 60/100 | 37 tests pass; no privacy tests, no oversized payload tests, no content-type tests, no XRechnung tests |
| CI/CD | 0/100 | Zero GitHub Actions workflows. Fatal gap. |
| Cloudflare deployability | 68/100 | wrangler.toml exists but VALID_API_KEYS is in [vars] (public), not a Wrangler secret |
| OpenAPI correctness | 65/100 | Spec exists but doesn't reflect new fields; missing XRechnung profile; missing remediation hints |
| Error semantics | 50/100 | Errors exist but no stable error_code, no machine-actionable remediation hints |
| Payload privacy | 78/100 | Good — but console.error(err) in global handler could expose request context; no privacy tests |
| EN16931 readiness | 10/100 | 7 placeholder rules cover ~5% of mandatory EN16931 rule set; not validated against official schematron |
| XRechnung readiness | 0/100 | Profile not in SUPPORTED_PROFILES; no KoSIT artifact ingestion path; no rules |
| PEPPOL BIS readiness | 12/100 | Profile exists; zero PEPPOL-specific rules beyond base EN16931 placeholders |
| Rule-pack versioning | 38/100 | Version string exists; no artifact hash, no RulePackManifest type, no artifact source tracking |
| Market readiness | 48/100 | GTM.md exists but too optimistic; no ICP, no pain calculator, no outbound templates |
| Sales readiness | 30/100 | No discovery questions, no close criteria, no outbound sequences, no demo script |
| Self-serve readiness | 45/100 | README is sparse; no ERROR_CODES.md, no INTEGRATION_GUIDE.md, no FAQ |
| Founder time efficiency | 52/100 | No CI means manual QA on every change; high ongoing cognitive overhead |

---

## Required Changes by Area

### GitHub repo hygiene (35 → target 85)
- Add `.github/workflows/ci.yml` with install, typecheck, test, build, openapi:check
- Add `.github/CODEOWNERS`
- Add `.github/pull_request_template.md`
- Add `.github/ISSUE_TEMPLATE/bug_report.md`
- Add branch protection rules (document in DEPLOYMENT.md)
- Move `VALID_API_KEYS` from `[vars]` to Wrangler secret

### Architecture (72 → target 88)
- Add `src/rules/rule-pack-manifest.ts` with `RulePackManifest` type
- Add `src/rules/profile-selector.ts` with deterministic profile→pack mapping
- Add `rules/sources/`, `rules/generated/`, `rules/fixtures/` directory structure
- Add `scripts/rules/` artifact sync/compile/verify scripts
- Add XRechnung-3.0 to SUPPORTED_PROFILES

### Statelessness (92 → target 97)
- Add explicit no-payload-logging guard comment in error handler
- Add `storage_statement` to 400/401 error responses
- Document that Cloudflare Observability is enabled (access log fields only)

### API design (62 → target 85)
- Add `deterministic_trace: boolean` to ValidationResponse
- Add `rule_pack_hash: string` to ValidationResponse
- Add `profile_resolution: ProfileResolution` to ValidationResponse
- Add `severity: 'error' | 'warning'` to RuleViolation
- Add `remediation_hint?: RemediationHint` to RuleViolation
- Update OpenAPI spec to reflect all new fields

### Auth/security (55 → target 80)
- Add `bodyLimit` middleware (1MB limit, 413 response)
- Add Content-Type validation for POST /v1/validate (415 response)
- Move VALID_API_KEYS to Wrangler secret in deployment docs
- Add security tests for all edge cases

### Tests (60 → target 82)
- Add `test/security.test.ts` — size limit, content-type, auth edge cases
- Add `test/privacy.test.ts` — console spy to prove no payload logging
- Add `test/rule-pack-selection.test.ts` — profile → pack mapping
- Add `test/determinism.test.ts` — identical input → identical output (except request_id)

### CI/CD (0 → target 90)
- Add `.github/workflows/ci.yml` — runs on push/PR to main
- Add npm scripts: `lint`, `ci`, `release:check`, `openapi:check`
- Add `docs/RELEASE.md`, `docs/DEPLOYMENT.md`, `docs/ROLLBACK.md`

### Cloudflare deployability (68 → target 88)
- Move VALID_API_KEYS to secret in deployment procedure
- Add worker name validation step
- Document rollback via wrangler rollback
- Add wrangler version pin in CI

### OpenAPI correctness (65 → target 85)
- Add XRECHNUNG-3.0 to supported profiles list
- Add ProfileResolution schema
- Add RemediationHint schema
- Update RuleViolation with severity and remediation_hint
- Update ValidationResponse with new fields
- Add openapi:check script to CI

### Error semantics (50 → target 80)
- Add `hint_type` enum to RemediationHint
- Add rule-specific remediation hints to all 7 rules
- Add VT-01 remediation hint (unsupported_profile)
- Document all error codes in docs/ERROR_CODES.md

### Payload privacy (78 → target 92)
- Add explicit comment in error handler: do not log request body
- Add privacy tests using console spy
- Add docs/THREAT_MODEL.md

### EN16931 readiness (10 → target 15)
- Current 7 rules cover invoice_number, issue_date, seller.country, buyer.country, total_amount, currency format, negative amount
- Honest ceiling this pass: ~15/100 — still placeholders, still not schematron-validated
- Document exactly what is real vs placeholder in COMPLIANCE_ARCHITECTURE.md
- Add `rules/sources/` with official source links

### XRechnung readiness (0 → target 18)
- Add XRECHNUNG-3.0 to SUPPORTED_PROFILES
- Add XRechnung RulePackManifest pointing to KoSIT official artefacts
- XRechnung uses same base rules for now; full CIUS implementation is Phase 2 of the compliance roadmap
- Add build-time artifact ingestion scripts (sync-official-artifacts.ts)
- Document in COMPLIANCE_DISCLAIMER.md

### PEPPOL BIS readiness (12 → target 18)
- PEPPOL-BIS-3.0 profile exists; add RulePackManifest pointing to OpenPEPPOL artefacts
- Same base rules apply; PEPPOL-specific BIS rules pending artifact ingestion
- Document clearly in COMPLIANCE_DISCLAIMER.md

### Rule-pack versioning (38 → target 72)
- Add RulePackManifest type with all required fields
- Add profile-selector that returns manifest for each profile
- Add RULE_PACK_HASH constant (placeholder format; real hash pending artifact ingestion)
- Add artifact_hash and source fields to manifests
- Wire rule_pack_hash into ValidationResponse

### Market readiness (48 → target 72)
- Add docs/ICP.md (exact first customer, persona, urgency)
- Add docs/PAIN_CALCULATOR.md (quantified cost of the problem)
- Add docs/PRICING_STRATEGY.md (value-based, per-validation)
- Add docs/OUTBOUND.md (first 100 prospects, email templates)

### Sales readiness (30 → target 70)
- Add docs/SALES_DISCOVERY.md (25-50 interview plan, discovery questions)
- Add docs/METRICS_SCORECARD.md
- Add docs/ROAD_TO_10K_MRR.md, ROAD_TO_1M_ARR.md, ROAD_TO_UNICORN.md

### Self-serve readiness (45 → target 78)
- Overhaul README.md (positioning, quickstart, curl examples, compliance disclaimer)
- Add docs/INTEGRATION_GUIDE.md (ERP, billing, PEPPOL access point patterns)
- Add docs/ERROR_CODES.md
- Add docs/FAQ.md
- Add more curl/node examples for XRechnung, PEPPOL, error cases

### Founder time efficiency (52 → target 80)
- CI removes manual QA burden on every push
- release:check gate prevents broken deploys
- Self-serve docs reduce support overhead
- NO_HUMAN_OPS_POLICY.md commits the automation-first principle

---

## Honest Assessment

**What works today (for real):**
- Stateless request handling — no data leaves the validation loop
- API key authentication — works correctly
- 7 deterministic placeholder rules — consistent results
- Hono + Cloudflare Workers deploy — tested architecture
- OpenAPI spec — accurate for current state
- 37 passing tests — reasonable confidence in current behavior

**What does NOT work today:**
- No actual EN16931 schematron validation against official artefacts
- No XRechnung support (missing from profiles entirely)
- No PEPPOL BIS 3.0 rules beyond EN16931 base
- No CI — every push is unverified
- No request size limiting — DoS vector
- No content-type enforcement — undefined behavior on XML/plain-text input
- No stable machine-readable error codes
- No remediation hints for API consumers

**Verdict:** Suitable for developer preview and architecture validation. Not suitable for production e-invoicing compliance until EN16931 schematron is integrated against official KoSIT/OpenPEPPOL artefacts.

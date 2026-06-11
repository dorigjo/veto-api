# Release Blockers

**Last updated:** 2026-06-12

Blockers are tracked in `release-status.json` (machine-readable). This document provides the technical rationale.

---

## CRITICAL — Blocks production_compliance and paid_beta

### BLK-01: EN16931 schematron not integrated

**What's missing:** The full CEN/TC 434 EN 16931-1:2017 schematron rule set (128+ binding rules) has not been compiled to TypeScript. The current implementation runs 7 hand-coded placeholder rules.

**Why it matters:** Any invoice passing VETO today passed only 7 structural checks. A production ERP or e-invoicing platform expects 100+ semantics rules — amount consistency, tax category codes, payment means codes, document-level date constraints, etc.

**Resolution path:** See [OFFICIAL_ARTEFACT_SYNC.md](OFFICIAL_ARTEFACT_SYNC.md) and [SCHEMATRON_DECISION_RECORD.md](SCHEMATRON_DECISION_RECORD.md) for the step-by-step integration plan.

**Detectable by:** `test/compliance-claims.test.ts` — will fail the moment `is_placeholder` is set to `false` without meeting all pre-conditions.

---

### BLK-02: PEPPOL BIS 3.0 schematron not integrated

**What's missing:** PEPPOL-specific schematron rules from OpenPEPPOL `peppol-bis-invoice-3` repository — endpoint ID format, GLN validation, invoice type code constraints, tax scheme identifiers.

**Why it matters:** A document that passes VETO today as PEPPOL-BIS-3.0 would fail the OpenPEPPOL validator in many real-world submissions.

**Resolution path:** Depends on BLK-01 (PEPPOL CIUS extends EN16931). Must resolve BLK-01 first, then layer PEPPOL-specific rules.

---

### BLK-03: XRechnung 3.0 CIUS not integrated

**What's missing:** KoSIT-specific schematron rules — Leitweg-ID (DE buyer routing identifier), mandatory German B2G fields, CIUS-specific code lists.

**Why it matters:** German public sector buyers require Leitweg-ID in every invoice. Any invoice without it will be rejected by PEPPOL access points.

**Resolution path:** Depends on BLK-01. After EN16931 base rules, add KoSIT CIUS rules via `scripts/rules/compile-xrechnung.ts`.

---

## HIGH — Blocks paid_beta and self_serve_saas

### BLK-04: Rate limiting binding not configured

**What's missing:** The `RATE_LIMITER` Cloudflare binding is not in `wrangler.toml`. The middleware is implemented and will activate automatically once the binding is configured.

**Resolution path:** See [RATE_LIMITING.md](RATE_LIMITING.md).

**Time to resolve:** ~1 hour (Cloudflare dashboard + `wrangler.toml` change).

---

### BLK-05: No metered billing

**What's missing:** Stripe integration for per-validation billing and plan enforcement.

**Resolution path:** See [BILLING_ARCHITECTURE.md](BILLING_ARCHITECTURE.md).

**Time to resolve:** ~2–4 days (Stripe metered billing + webhook handler + KV counter).

---

### BLK-06: Manual API key provisioning only

**What's missing:** Self-serve signup flow. Currently keys are issued by editing `VALID_API_KEYS` env.

**Resolution path:** See [API_KEY_PROVISIONING.md](API_KEY_PROVISIONING.md).

**Time to resolve:** ~2–3 days (Stripe checkout + KV key store + provisioning worker).

---

## MEDIUM — Blocks cloudflare_deploy_production_safe

### BLK-07: VALID_API_KEYS in wrangler.toml [vars]

**What's missing:** `VALID_API_KEYS` is set as a `[vars]` entry in committed source. Anyone with repo access can see the dev default.

**Resolution path:** See [PRODUCTION_SECRETS.md](PRODUCTION_SECRETS.md).

**Time to resolve:** 5 minutes (`wrangler secret put VALID_API_KEYS`).

**Note:** The dev default (`dev-key-change-in-production`) is not a real credential. Risk is low until real API keys are used in production. Still must be resolved before any production deployment.

---

## Resolved Blockers (for reference)

| ID | Title | Resolved |
|---|---|---|
| — | Payload logging | 2024-11 — privacy tests enforce no-log guarantee |
| — | Missing auth middleware | 2024-11 — `apiKeyMiddleware` in production |
| — | No body size limit | 2024-11 — `bodyLimit` 1 MB |
| — | Missing Content-Type check | 2024-11 — 415 on non-JSON |
| — | No compliance placeholder signal | 2024-11 — `is_placeholder`, PLACEHOLDER hash everywhere |

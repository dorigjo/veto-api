# Roadmap

VETO follows a lean, iterative roadmap. Each phase ships something usable before adding complexity.

---

## Current: v0.1 — MVP Foundation (shipped)

- Cloudflare Workers + Hono + TypeScript
- `GET /v1/health`, `GET /v1/version`, `POST /v1/validate`
- API key authentication
- 7 placeholder rules (BR-01, BR-02, BR-04, BR-07, BR-09, BR-CL-04, BR-DEC-01)
- Deterministic response format with `decision`, `blocking_errors`, `warnings`, `trace`
- Rule pack versioning
- No storage by design
- OpenAPI 3.1 spec

---

## v0.2 — Real EN 16931 Rules

**Goal:** Production-grade rule coverage for core EN 16931 requirements.

- Implement the full mandatory BR-* rule set from EN 16931-1:2017
- ISO 8601 date format validation for `issue_date`
- ISO 3166-1 alpha-2 validation for country codes
- ISO 4217 full currency list validation (not just regex)
- VAT number format validation (basic EU patterns)
- Tax point date rules
- Unit code validation (UN/CEFACT)

---

## v0.3 — PEPPOL BIS Billing 3.0

**Goal:** PEPPOL-specific rule set on top of EN 16931 base.

- PEPPOL-specific CIUS rules (UBL/CII extensions)
- Buyer/seller identifier type validation (GLN, IBAN, VAT)
- PEPPOL document type identifier checks
- Routing identifier format rules (0088, 0007, 0106, etc.)

---

## v0.4 — API Management

**Goal:** Commercial readiness.

- Per-key rate limiting via Cloudflare Rate Limiting rules
- Usage tracking (request count only — no invoice content) via Cloudflare Analytics Engine
- API key provisioning endpoint (POST /v1/keys — admin only)
- Per-key labels and expiry

---

## v0.5 — National Extensions (DE/AT/CH)

**Goal:** XRECHNUNG and Austrian/Swiss CIUS.

- XRechnung 3.0 (German national CIUS)
- Peppol Austria
- Swiss QR Invoice metadata rules (stub)

---

## v1.0 — General Availability

**Goal:** Stable API contract, SLA, documented compliance posture.

- Semantic versioning guarantee for API and rule packs
- Rule pack changelogs
- SLA documentation
- Migration guides between rule pack versions
- Full OpenAPI spec with examples for all edge cases

---

## Explicitly Out of Scope (Forever)

- PEPPOL Access Point (SMP, SML, AS4 transport)
- Invoice routing or delivery
- Document storage or archival
- Pre-filled invoice templates
- ERP deep integrations
- Enterprise consulting
- Runtime LLM decisions for compliance

---

## Principle

One founder. Minimal maintenance. Grow revenue before adding complexity. Each milestone is shippable and generates value before the next one starts.

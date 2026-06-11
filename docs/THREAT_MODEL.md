# VETO Threat Model

## System boundaries

VETO is a stateless Cloudflare Workers API. The attack surface is:
- HTTPS requests to `/v1/validate`, `/v1/health`, `/v1/version`
- Cloudflare's global edge network (TLS termination, DDoS mitigation)
- Wrangler secrets (VALID_API_KEYS)
- GitHub repository (source code)
- npm supply chain

---

## Threat 1: Payload privacy

**Risk:** Invoice content (invoice numbers, amounts, party names) appears in logs.

**Mitigations in place:**
- `app.onError` logs only `err.message`, never `c.req` or request body
- No `console.log` calls in any route handler
- Cloudflare Observability logs: method, path, status, duration only — no body fields
- `storage_statement` field in every response confirms stateless processing
- Privacy tests in `test/privacy.test.ts` spy on console and assert no invoice fields appear

**Residual risk:** Cloudflare network-level packet capture (outside our control). Mitigated by TLS in transit.

---

## Threat 2: API key leakage

**Risk:** `VALID_API_KEYS` secret exposed in code, logs, or git history.

**Mitigations in place:**
- `VALID_API_KEYS` must be set via `wrangler secret put` — never in `[vars]` in production
- `.gitignore` excludes `.env*` and `*.secret*`
- No key logging — apiKeyMiddleware reads the key, compares it, and never logs it
- Keys validated via constant-time array lookup (no timing oracle on length)

**Residual risk:** Key compromise via developer machine or Cloudflare account access.

**Response if compromised:**
1. `wrangler secret put VALID_API_KEYS` with new keys immediately
2. Old keys invalidated within seconds (Cloudflare Worker restart)
3. No stored data to purge

---

## Threat 3: Abuse and rate limiting

**Risk:** An attacker runs unlimited validation requests, driving compute costs.

**Current state:** No per-key rate limiting. Cloudflare Workers free tier: 100K requests/day.

**Mitigations in place:**
- Request body limited to 1MB (prevents large-payload abuse)
- 413 response on oversized body
- Cloudflare's global DDoS protection layer

**Residual risk:** API key sharing, key leakage enabling unauthorized use.

**Planned (v0.4):** Cloudflare KV-based per-key request counting (metadata only, no invoice content).

---

## Threat 4: Supply chain risk

**Risk:** Compromised npm package injects malicious code into the validation path.

**Dependencies:**
- `hono` — web framework (widely audited)
- `zod` — schema validation (widely audited)
- `@cloudflare/workers-types` — type definitions only (no runtime code)
- `wrangler` — build/deploy tool (never runs in production)
- `vitest` — test runner (never runs in production)
- `tsx` — script runner (never runs in production)

**Mitigations in place:**
- `package-lock.json` pins exact versions
- Minimal dependency surface (2 production deps)
- CI runs `npm ci` (respects lockfile)

**Residual risk:** Malicious package version published to npm between lockfile update and install.

**Planned:** Dependabot alerts, `npm audit` in CI.

---

## Threat 5: Rule-pack tampering

**Risk:** Rule pack content is altered post-compilation, changing compliance decisions silently.

**Current state:** RULE_PACK_HASH is a placeholder (not a real cryptographic hash of rule content).

**Mitigations in place:**
- `rule_pack_hash` field in every response — API consumers can detect unexpected changes
- `deterministic_trace: true` signals rule execution is not randomized

**Planned:** Real SHA256 of compiled rule modules embedded at build time via `compile-rule-pack.ts`.

---

## Threat 6: Regulatory correctness risk

**Risk:** VETO reports VALID for an invoice that a tax authority or PEPPOL access point would reject.

**Current state:** CRITICAL RISK. Rules are hand-coded approximations, NOT validated against official schematron artefacts.

**Mitigations in place:**
- `docs/COMPLIANCE_DISCLAIMER.md` states this clearly
- `is_placeholder: true` in every RulePackManifest
- Response includes `rule_pack_hash` with `PLACEHOLDER` in the value — consumers can detect placeholder packs

**Planned mitigation:** Schematron artifact ingestion pipeline (`scripts/rules/`) producing rule packs validated against KoSIT/OpenPEPPOL golden test fixtures.

**Until this is done:** VETO must not be used as the sole compliance gate for production invoicing. Pre-submission human review or official validator comparison required.

---

## Out of scope threats

- Physical infrastructure attacks (Cloudflare's responsibility)
- GDPR data subject requests (no data stored — there is nothing to respond with)
- Insider threat at Cloudflare (outside VETO's control)
- Invoice content that is legally sensitive but syntactically valid (VETO validates structure, not legality)

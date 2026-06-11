# Production Safety Status

**Last updated:** 2026-06-12  
**Engine version:** 0.2.0  
**Rule pack:** 2024.1 (PLACEHOLDER — 7 rules)

## Summary

VETO is safe to deploy as a **developer-preview** API. It is **not safe** to claim production-grade EN16931, PEPPOL BIS 3.0, or XRechnung compliance. See [RELEASE_BLOCKERS.md](RELEASE_BLOCKERS.md) and [GO_NO_GO.md](GO_NO_GO.md) for the full decision matrix.

---

## Safety Assessment by Category

### Privacy / Data Handling — SAFE

| Vector | Status | Evidence |
|---|---|---|
| Invoice payload stored | Never | No storage bindings in wrangler.toml |
| Invoice payload logged | Never | Error handler logs only `err.message`; `test/privacy.test.ts` asserts no payload fields in logs |
| PII in traces | Never | Trace entries contain only rule_id + pass/fail; no invoice data |
| GDPR Article 25 (PbD) | Met | Stateless by design — no data to retain or delete |

### Authentication — SAFE (with caveat)

| Vector | Status | Notes |
|---|---|---|
| Unauthenticated access | Blocked | `apiKeyMiddleware` returns 401 on all missing/invalid keys |
| Key rotation | Manual | Keys are in `VALID_API_KEYS` env; change requires redeployment |
| Key storage in source | **GAP** | `wrangler.toml [vars]` exposes dev default — see BLK-07 |
| Brute force protection | Partial | Rate limit middleware wired; binding not yet configured |

### Compliance Claims — CLEARLY MARKED AS PLACEHOLDER

| Vector | Status | Evidence |
|---|---|---|
| `rule_pack_hash` | Contains `PLACEHOLDER` | `src/lib/version.ts` |
| All manifests | `is_placeholder: true` | `src/rules/rule-pack-manifest.ts` |
| Compliance disclaimer | Present | `docs/COMPLIANCE_DISCLAIMER.md` |
| False-claim guard tests | Present | `test/compliance-claims.test.ts` |

### Input Validation — SAFE

| Vector | Status | Notes |
|---|---|---|
| Oversized payloads | Rejected 413 | `bodyLimit` 1 MB hard limit |
| Non-JSON Content-Type | Rejected 415 | Explicit check before parse |
| Malformed JSON | Rejected 400 | `c.req.json()` wrapped in try/catch |
| Schema violation | Rejected 400 | Zod `safeParse` with error detail |
| SQL / Command injection | Not applicable | Stateless; no DB; no shell calls |
| XSS | Not applicable | API only; no rendered output |

### Infrastructure — PARTIAL

| Vector | Status | Notes |
|---|---|---|
| Rate limiting | Middleware ready; **binding absent** | See BLK-04 |
| DDoS | Cloudflare edge protection (inherent) | Workers run on CF infrastructure |
| TLS | Enforced by Cloudflare | All Workers traffic is TLS |
| Cold-start isolation | Handled by CF V8 isolates | Each request is isolated |
| Secrets management | **GAP in production path** | Must migrate from `[vars]` to `wrangler secret put` |

### Observability — PARTIAL

| Vector | Status | Notes |
|---|---|---|
| CF Workers Logs | Enabled (`observability = true`) | Basic request/response logging |
| Error tracking | Structured `console.error` | Message only, no payload |
| Metrics / APM | Not integrated | Required before paid-beta |
| Alerting | Not configured | Required before paid-beta |

---

## What "Developer Preview Ready" Means

- API contract is stable and versioned
- All 7 placeholder rules execute deterministically
- Privacy guarantees are auditable via test suite
- Compliance signals are honest (PLACEHOLDER everywhere)
- Safe to share with design partners for integration work
- **Not safe to invoice customers for compliance validation**
- **Not safe to claim EN16931 / PEPPOL / XRechnung certification**

# Go / No-Go Matrix

**Last updated:** 2026-06-12

Each scenario is independent — "GO" for developer preview does not imply "GO" for paid beta.

---

## Developer Preview

**Decision: GO**

Safe to share with design partners. Honest API contract, stable schema, placeholder signals everywhere.

| Gate | Status |
|---|---|
| API contract stable and versioned | ✅ |
| All placeholder signals present (`rule_pack_hash`, `is_placeholder`) | ✅ |
| Privacy guarantee auditable | ✅ (`test/privacy.test.ts`) |
| Compliance disclaimer served | ✅ (`docs/COMPLIANCE_DISCLAIMER.md`) |
| Auth middleware present | ✅ |
| No payload logging | ✅ |

---

## Cloudflare Deploy (dev keys / staging)

**Decision: CONDITIONAL GO**

Can be deployed to Cloudflare Workers with the following pre-flight:

1. **Run `wrangler secret put VALID_API_KEYS`** before deploying (do not rely on `[vars]` default)
2. Confirm `VALID_API_KEYS` secret is set in Cloudflare dashboard
3. Share the deployed URL only with trusted design partners

| Gate | Status |
|---|---|
| Typecheck passes | ✅ |
| Tests pass (104+) | ✅ |
| Build passes | ✅ |
| OpenAPI spec valid | ✅ |
| `wrangler secret put VALID_API_KEYS` done | ⚠️ Required before deploy |
| Rate limiting binding configured | ⚠️ Recommended; not blocking |

---

## Paid Beta

**Decision: NO GO**

Remaining blockers before collecting payment:

| Gate | Status | Blocker |
|---|---|---|
| EN16931 schematron integrated | ❌ | BLK-01 |
| Rate limiting active | ❌ | BLK-04 |
| Stripe billing integrated | ❌ | BLK-05 |
| Usage metering working | ❌ | BLK-05 |
| Plan enforcement (request caps) | ❌ | BLK-04 + BLK-05 |
| SLA documentation | ❌ | Depends on rate limiting + billing |

---

## Production Compliance

**Decision: NO GO**

Cannot claim to validate invoices for regulatory submission until all three official schematron artefacts are integrated.

| Gate | Status | Blocker |
|---|---|---|
| EN16931 128+ rules active | ❌ | BLK-01 |
| PEPPOL BIS 3.0 rules active | ❌ | BLK-02 |
| XRechnung 3.0 CIUS rules active | ❌ | BLK-03 |
| Official artefact hashes in manifests | ❌ | Depends on BLK-01/02/03 |
| `is_placeholder: false` for all manifests | ❌ | Depends on above |
| Compliance test suite using official fixtures | ❌ | Depends on BLK-01 |
| Disclaimer removed from API responses | ❌ | Depends on all above |

---

## Self-Serve SaaS

**Decision: NO GO**

Requires paid-beta GO plus:

| Gate | Status | Blocker |
|---|---|---|
| All paid-beta gates | ❌ | See above |
| Self-serve signup flow | ❌ | BLK-06 |
| KV-based key store | ❌ | BLK-06 |
| Automated key provisioning | ❌ | BLK-06 |
| Customer portal (key rotation, usage) | ❌ | Post-BLK-06 |

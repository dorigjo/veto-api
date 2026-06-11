# VETO Automation Blueprint

This is the operational automation architecture for a solo-founder infrastructure SaaS targeting €1M ARR with minimal human ops.

## Design constraint

**Every recurring operational task must be automatable.** If it requires a human decision more than once, automate it. The founder's time is the scarcest resource.

---

## 1. API key provisioning

**Current state (v0.1–0.2):** Manual — email hello@veto.dev, key issued via `wrangler secret put`.

**Target (v0.4):**
- Self-serve registration → Stripe checkout → webhook → Cloudflare KV entry created
- Key format: `veto-live-<128-bit-random>`
- Key stored as: hash in Cloudflare KV (never the raw key)
- Rate limit metadata: `{ validations_this_month: N, plan_limit: N }`
- Key rotation: self-serve via account API or dashboard link in email

**Implementation:** Cloudflare Worker + KV (metadata only, no invoice data).

---

## 2. Usage metering without invoice storage

**Constraint:** Must not store anything correlated to invoice content.

**Acceptable metering metadata:**
- Timestamp (epoch second, not millisecond — prevents timing correlation)
- Profile used (EN16931 / PEPPOL-BIS-3.0 / XRECHNUNG-3.0)
- Decision outcome (VALID / INVALID / WARNING)
- Rule pack hash (which version ran)
- Request count increment (atomic counter in KV)

**Never stored:**
- Invoice number
- Invoice amount
- Party names or countries
- Any invoice field value

**Implementation:** Cloudflare Workers KV for counters. Each key: `usage:{api_key_hash}:{YYYY-MM}`. Value: `{ count: N }`. TTL: 90 days.

---

## 3. Rate limiting without payload persistence

**Implementation:** Cloudflare Workers Rate Limiting API (built-in, no KV needed for basic limits).

```typescript
// Per-key rate limit using Cloudflare Rate Limiting
const { success } = await env.RATE_LIMITER.limit({ key: apiKeyHash });
if (!success) return c.json({ error: 'Rate limit exceeded' }, 429);
```

**Limits by plan:**
- Free: 1K/month
- Starter: 50K/month
- Growth: 500K/month
- Scale: 5M/month

---

## 4. Stripe integration (planned v0.4)

**Flow:**
```
User signs up → Stripe Checkout → payment_intent.succeeded webhook
    → Cloudflare Worker webhook handler
    → Generate API key
    → Store key hash + plan in KV
    → Send key via email (SendGrid/Postmark)
    → Never touch invoice data
```

**No subscription management UI needed** — Stripe handles plan upgrades, cancellations, receipts.

---

## 5. Self-serve onboarding

**Target:** User goes from signup to first successful validation in <10 minutes.

**Automation points:**
- Welcome email with API key + quickstart curl command (automated)
- Stripe receipt = proof of activation (automated)
- `/v1/version` shows rule pack status (machine-readable)
- Error responses include `remediation_hint` — no support email needed

**No concierge calls.** No Slack/Zoom onboarding. README + docs/QUICKSTART.md + docs/INTEGRATION_GUIDE.md is the onboarding.

---

## 6. Automated docs generation

- OpenAPI spec → Redoc/Scalar docs page: auto-generated on deploy
- `docs/ERROR_CODES.md` → single source of truth for support deflection
- Changelog: generated from conventional commits via `standard-version` or `changeloggen`
- Rule pack changelog: auto-generated when rule pack version bumps

---

## 7. Rule-pack monitoring

**Monitor for:**
- New releases on CEN/TC 434 GitHub
- New releases on OpenPEPPOL GitHub
- New releases on KoSIT GitHub

**Automation:**
- GitHub Dependabot-style release watcher (GitHub Actions on schedule)
- Weekly check script: `scripts/rules/sync-official-artifacts.ts` run in CI on a cron
- Slack/email alert when upstream release detected → human reviews, then triggers artifact ingestion

---

## 8. Changelog generation

```bash
# On each release
npx conventional-changelog -p angular -i CHANGELOG.md -s
```

Commit message format: `feat(rules): add EN16931 BR-09 decimal validation`

---

## 9. Customer support via machine-readable errors

Every `blocking_error` contains:
- `rule_id` — linkable to `docs/ERROR_CODES.md`
- `message` — human-readable explanation
- `remediation_hint.description` — exact fix instruction

Support deflection rate target: >80% of support queries answered by the error response itself.

**Support playbook:** If a user emails about a validation error, respond with a link to `docs/ERROR_CODES.md#{rule_id}`. That doc contains everything they need.

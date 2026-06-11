# VETO No-Human-Ops Policy

This policy binds product, commercial, and technical decisions.  
Violations erode the unit economics that make this business viable as a solo operation.

---

## The constraint

VETO is built by a solo technical founder with limited time.  
Gross margin must approach 90%+.  
CAC must be near-zero.  
Every €1 of ARR must require approaching €0 of ongoing human labor.

This is only possible if the product is designed from day one to operate without human intervention.

---

## What VETO will never do

### No custom integrations

VETO provides one API. No customer-specific endpoints, no custom field mappings, no ERP connectors built on request. Customers integrate against the standard API or they don't use VETO.

**Why:** Custom integrations create support debt, make every customer a snowflake, and kill the founder's time.

### No manual invoice review

VETO never receives, sees, or touches an actual invoice document. The API validates invoice *metadata* deterministically. There is no "manual review" workflow, no human in the validation loop, no escalation path to a human reviewer.

**Why:** Manual review doesn't scale, creates liability, and destroys the privacy promise.

### No dashboard dependency

There is no VETO dashboard for customers. Customers integrate the API, read error codes, and fix their invoices. The `deterministic_trace` and `remediation_hint` fields ARE the dashboard.

**Why:** Dashboards require UX, auth, frontend maintenance, and support. They don't generate revenue proportional to their cost.

### No concierge onboarding

No onboarding calls. No Zoom demos for standard plans. No personal setup assistance. The README, QUICKSTART, INTEGRATION_GUIDE, and ERROR_CODES docs are the onboarding.

**Exception:** Enterprise tier (>€1K/month) may receive a 30-minute technical integration call, documented as a recoverable time investment.

### No per-customer rule hacks

VETO applies the same rules to every customer. No customer-specific rule overrides, no "we added a special exception for Customer X." Rules are derived from official standards bodies.

**Why:** Per-customer rules create invisible technical debt, compliance risk, and a maintenance nightmare.

---

## What automation must handle

| Function | Automation method |
|----------|------------------|
| API key provisioning | Self-serve signup + Stripe webhook (v0.4) |
| Usage billing | Stripe metered billing + Cloudflare KV counters |
| Rate limiting | Cloudflare Rate Limiting API |
| Invoice validation | Deterministic rule engine (no human judgment) |
| Error explanations | Machine-readable remediation hints |
| Documentation | Generated from OpenAPI + markdown sources |
| Rule pack updates | CI pipeline + artifact ingestion scripts |
| Customer support L1 | Error codes doc + FAQ |
| Changelog | Conventional commits + changelog generator |

---

## Acceptable human involvement

- Reviewing and approving rule pack updates (1x per upstream release, ~30 min)
- Escalated enterprise support (>€1K/month customers only)
- Security incident response
- Legal/compliance decisions that cannot be automated
- Annual review of pricing and ICP

Everything else: automate or eliminate.

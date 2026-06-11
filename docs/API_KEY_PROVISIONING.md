# API Key Provisioning

**Status:** Manual only  
**Blocker:** BLK-06

---

## Current State (Manual)

Keys are set by hand via `wrangler secret put VALID_API_KEYS`. All keys share one secret string. There is no per-customer metadata, no revocation, no usage tracking. This is acceptable for developer preview with 1–10 design partners.

---

## Target Architecture: Stripe + KV

Self-serve provisioning requires:

1. **Customer signs up** → Stripe Checkout creates a subscription
2. **Stripe webhook fires** → provisioning Worker runs
3. **Provisioning Worker** generates a key, stores it in Cloudflare KV
4. **Key delivered to customer** via webhook response / dashboard / email
5. **VETO API** reads KV on every request to validate the key and fetch plan metadata

---

## Data Model: Cloudflare KV

### Key namespace: `veto-api-keys`

```
key:sk_live_abc123  →  {
  "customer_id": "cus_stripe_xyz",
  "plan": "developer",
  "created_at": "2026-06-12T00:00:00Z",
  "revoked_at": null,
  "monthly_limit": 10000,
  "current_period_start": "2026-06-01T00:00:00Z"
}
```

### Usage namespace: `veto-api-usage`

```
usage:sk_live_abc123:2026-06  →  4,271  (atomic counter, incremented per request)
```

Cloudflare KV does not support atomic increments natively. Use a Durable Object counter for exact billing, or accept eventual-consistency counts for advisory rate limits.

---

## Request Auth Flow (post-KV)

```typescript
// src/middleware/api-key.ts (future)
const raw = c.req.header('X-API-Key');
if (!raw) return c.json({ error: 'Missing API key' }, 401);

const meta = await env.KV.get<KeyMeta>(`key:${raw}`, { type: 'json' });
if (!meta || meta.revoked_at) {
  return c.json({ error: 'Invalid or revoked API key' }, 401);
}

c.set('customer_id', meta.customer_id);
c.set('plan', meta.plan);
await next();
```

---

## Provisioning Worker

A separate Cloudflare Worker (`workers/provisioning`) handles Stripe webhooks:

```typescript
// Handle checkout.session.completed
async function handleCheckoutComplete(session: Stripe.CheckoutSession) {
  const apiKey = `sk_live_${generateSecureKey()}`;
  const customerId = session.customer as string;
  const plan = getPlanFromPriceId(session.line_items?.[0]?.price?.id);

  await env.KV.put(`key:${apiKey}`, JSON.stringify({
    customer_id: customerId,
    plan,
    created_at: new Date().toISOString(),
    revoked_at: null,
    monthly_limit: PLAN_LIMITS[plan],
    current_period_start: new Date().toISOString(),
  }));

  // Send key to customer (Stripe customer metadata or email)
  await notifyCustomer(customerId, apiKey);
}
```

Key generation: `crypto.randomUUID()` is available in CF Workers. Prefix with `sk_live_` for production, `sk_test_` for test mode.

---

## Key Revocation

```sh
# Immediate revocation — no redeployment required
wrangler kv key put --namespace-id=<id> "key:sk_live_abc123" \
  '{"revoked_at":"2026-06-12T10:00:00Z",...}'
```

KV reads are cached at the edge for up to 60 seconds. Revoked keys will be honored within 60 seconds of revocation.

For instant revocation, set KV TTL to 0 (no cache) — this increases read latency by ~5 ms per request.

---

## Plan Limits

| Plan | Monthly requests | Price |
|---|---|---|
| Free (dev) | 1,000 | $0 |
| Developer | 10,000 | $49/mo |
| Professional | 100,000 | $199/mo |
| Enterprise | Custom | Custom |

These are illustrative. Finalize based on [PRICING_STRATEGY.md](../PRICING_STRATEGY.md) and cost modeling.

---

## Implementation Steps (BLK-06 resolution)

1. Create `workers/provisioning/` — Stripe webhook handler
2. Add `KV_KEYS` namespace binding to `wrangler.toml`
3. Add `KV_USAGE` namespace binding (or Durable Object)
4. Update `apiKeyMiddleware` to read from KV
5. Update `rateLimitMiddleware` to enforce KV plan limits
6. Set up Stripe Checkout flow (hosted page or embedded)
7. Configure Stripe webhook endpoint pointing to provisioning Worker
8. Test full flow: signup → key issued → key validates → usage counted

**Estimated effort:** 2–3 days

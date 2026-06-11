# Billing Architecture

**Status:** Not implemented  
**Blocker:** BLK-05

---

## Privacy Constraint

VETO never stores invoice payloads. Billing must be based on **request counts only**, never invoice content. This is a hard invariant — do not add billing instrumentation that captures invoice fields.

What is safe to bill on:
- Request count per API key per billing period
- Profile requested (`target_profile`) — for plan tiering by feature
- Response decision (`VALID`, `INVALID`, `WARNING`) — for analytics only, never billed

What must never be captured for billing:
- Invoice number
- Seller / buyer name or country
- Invoice amount
- Any invoice field or derivative thereof

---

## Architecture

### Components

```
Customer → Stripe Checkout → Stripe Subscription
                                      │
                            Stripe Webhook (checkout.session.completed,
                                           customer.subscription.updated,
                                           invoice.payment_failed)
                                      │
                                      ▼
                         workers/provisioning (CF Worker)
                                      │
                              ┌───────┴────────┐
                              ▼                ▼
                      KV: veto-api-keys  KV: veto-api-usage
                      (key metadata)     (monthly counters)
                              │
                              ▼
                      VETO API Worker (reads KV on each request)
                              │
                              ▼
                      Stripe Metered Usage reporting
                      (periodic: aggregate KV counts → Stripe)
```

### Metering Strategy

Two options:

**Option A: Stripe Metered Billing**  
Report usage to Stripe via `stripe.subscriptionItems.createUsageRecord()` at the end of each billing period (or periodically). Stripe calculates the invoice.

- Pro: Simple, Stripe handles invoicing
- Con: Usage reports are eventual (hourly batch), not real-time
- Recommended for initial paid-beta

**Option B: Cloudflare Durable Objects counter + Stripe usage records**  
Use a Durable Object per customer to maintain an exact request count. The DO increments atomically on every request. A cron job reports to Stripe daily.

- Pro: Exact counts, real-time enforcement
- Con: More complex, Durable Objects add ~5 ms per request

**Decision:** Option A for paid-beta. Migrate to Option B when customer complaints about count discrepancies arise (usually never for metered APIs).

---

## Usage Reporting to Stripe

```typescript
// Cron Worker — runs daily at midnight UTC
async function reportUsage(env: Env) {
  const keys = await env.KV.list({ prefix: 'key:sk_live_' });
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const now = Math.floor(Date.now() / 1000);

  for (const key of keys.keys) {
    const apiKey = key.name.replace('key:', '');
    const meta = await env.KV.get<KeyMeta>(key.name, { type: 'json' });
    if (!meta?.stripe_subscription_item_id) continue;

    const period = getCurrentBillingPeriod();
    const usageKey = `usage:${apiKey}:${period}`;
    const count = parseInt(await env.KV.get(usageKey) ?? '0', 10);

    await stripe.subscriptionItems.createUsageRecord(
      meta.stripe_subscription_item_id,
      { quantity: count, timestamp: now, action: 'set' },
    );
  }
}
```

---

## Plan Enforcement

When a customer exceeds their monthly limit:

1. KV usage counter exceeds plan limit
2. Rate limit middleware returns 429 with `error: "Monthly request limit exceeded"`
3. Stripe billing cycle resets counter at period_end
4. Customer can upgrade via Stripe Customer Portal link

```typescript
// In rateLimitMiddleware (future enhancement)
const usage = parseInt(await env.KV.get(`usage:${apiKey}:${period}`) ?? '0', 10);
if (usage >= meta.monthly_limit) {
  return c.json({
    error: 'Monthly request limit exceeded',
    limit: meta.monthly_limit,
    upgrade_url: 'https://billing.veto.dev/portal',
  }, 429);
}
```

---

## Stripe Configuration

| Setting | Value |
|---|---|
| Billing model | Metered (pay-per-use) or flat-rate subscription |
| Metered aggregation | SUM (monthly request count) |
| Billing period | Monthly |
| Trial | 14 days free (developer plan) |
| Payment failure grace period | 3 days (then key suspended) |

Stripe products to create:
- `veto-developer` — $49/mo, 10,000 requests
- `veto-professional` — $199/mo, 100,000 requests
- `veto-enterprise` — contact sales

---

## Webhook Security

Stripe webhooks must be verified with `stripe.webhooks.constructEvent()` using `STRIPE_WEBHOOK_SECRET`. This secret is set via `wrangler secret put STRIPE_WEBHOOK_SECRET`.

Never process a webhook without signature verification. A forged webhook could provision API keys for unpaid customers.

---

## Implementation Steps (BLK-05 resolution)

1. Create Stripe account + products + prices
2. Implement `workers/provisioning/` with webhook handler
3. Add usage increment to VETO API request path (KV write, async, non-blocking)
4. Implement daily cron Worker for usage reporting to Stripe
5. Implement `stripe.webhooks.constructEvent()` verification
6. Implement payment failure handler (suspend key on `invoice.payment_failed`)
7. Test full flow: subscribe → validate → usage counted → billed

**Estimated effort:** 3–5 days

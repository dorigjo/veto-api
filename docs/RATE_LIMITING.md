# Rate Limiting

**Status:** Middleware implemented, binding not yet configured  
**Blocker:** BLK-04

---

## Current State

The rate limiting middleware (`src/middleware/rate-limit.ts`) is wired into the `/v1/validate` route between `bodyLimit` and `apiKeyMiddleware`. It gracefully degrades: when the `RATE_LIMITER` Cloudflare binding is absent, all requests pass through. When the binding is present, it enforces limits.

---

## Architecture

### Middleware Order on POST /v1/validate

```
Request
  │
  ▼
bodyLimit (1 MB hard cap — reject before any compute)
  │
  ▼
rateLimitMiddleware (per-API-key bucket — blocks abuse before auth lookup)
  │
  ▼
apiKeyMiddleware (validates key — now safe from brute-force flooding)
  │
  ▼
handler (validation logic)
```

Rate limiting fires before auth intentionally — this protects against brute-force credential probing. Unauthenticated requests land in the `unauthenticated` bucket.

### Rate Limit Key

```typescript
`veto:v1:${rawApiKey}` // e.g. "veto:v1:sk_live_abc123"
```

The key is prefixed with `veto:v1:` to namespace it (multiple services can share a Cloudflare account). The raw API key is used directly — Cloudflare's rate limiter hashes keys internally before storage and does not persist the raw value.

---

## Configuring the Cloudflare Rate Limiting Binding

### Step 1 — Create a Rate Limit namespace in Cloudflare dashboard

1. Navigate to **Cloudflare Dashboard → Workers → Rate Limiting**
2. Create a new namespace, e.g. `veto-api-rate-limit`
3. Note the `namespace_id` (a UUID)

### Step 2 — Add to wrangler.toml

Uncomment and fill in the binding in `wrangler.toml`:

```toml
[[unsafe.bindings]]
name = "RATE_LIMITER"
type = "ratelimit"
namespace_id = "YOUR_NAMESPACE_ID"
simple = { limit = 10000, period = 2592000 }
```

`limit = 10000, period = 2592000` = 10,000 requests per 30 days (developer tier).

### Step 3 — Deploy

```sh
wrangler deploy
```

The middleware activates automatically — no code change required.

### Step 4 — Verify

```sh
# Trigger 429 by exhausting a test key's limit
curl -X POST https://your-worker.workers.dev/v1/validate \
  -H "X-API-Key: test-rate-limit-key" \
  -H "Content-Type: application/json" \
  -d '{"invoice":{},"target_profile":"EN16931"}'
```

After hitting the configured limit, the next request returns:
```json
{ "error": "Rate limit exceeded", "retry_after_seconds": 60 }
```

---

## Recommended Limits by Plan

| Plan | limit | period | Notes |
|---|---|---|---|
| Free / Dev preview | 100 | 86400 (1 day) | Enough for integration testing |
| Developer | 10,000 | 2592000 (30 days) | ~333/day average |
| Professional | 100,000 | 2592000 | ~3,333/day average |
| Enterprise | Custom | Custom | Via Stripe metered billing |

For metered billing plans, the rate limit should be set to the plan maximum. When the billing counter exceeds the plan limit, the rate limiter blocks additional requests until the next billing cycle or upgrade.

---

## Testing Rate Limiting

`test/rate-limit.test.ts` covers:

- Requests pass when binding is absent (graceful degradation)
- Returns 429 when binding returns `{ success: false }`
- Passes through when binding returns `{ success: true }`
- Rate limit key includes the `veto:v1:` prefix
- Rate limit fires before auth (unauthenticated requests are also rate-limited)

The tests use Vitest mocks — no real Cloudflare binding required.

---

## Multi-Region Consistency

Cloudflare Rate Limiting is globally consistent within an approximate window. Requests from different CF edge nodes to the same namespace converge within the configured `period`. This is eventual consistency — short burst over-admission (~10–20%) is possible and acceptable for a metered API.

If hard enforcement is required (e.g. regulatory requirement), use Cloudflare Durable Objects for exact-count distributed rate limiting. This adds ~5–10 ms per request.

---

## Future: Per-Plan Limits via KV

Once Stripe billing is integrated (BLK-05), the rate limit key can be looked up in KV to get the customer's plan limit dynamically:

```typescript
const plan = await env.KV.get(`plan:${apiKey}`);
const limit = PLAN_LIMITS[plan ?? 'free'];
const { success } = await env.RATE_LIMITER.limit({
  key: `veto:v1:${apiKey}:${currentBillingPeriod}`,
});
```

This is not required until paid-beta.

# Production Secrets Management

**Status:** BLK-07 — VALID_API_KEYS is currently in wrangler.toml [vars]

---

## The Problem

`wrangler.toml` is committed to source control. The `[vars]` section is visible to anyone with read access to the repository. The current entry:

```toml
[vars]
VALID_API_KEYS = "dev-key-change-in-production"
```

This is a dev placeholder — not a real credential. The risk is low today. It becomes critical the moment you use a real API key in `[vars]`, which must never happen.

---

## Rule

> **Never put real secrets in `wrangler.toml [vars]`.**  
> `[vars]` is for non-secret configuration defaults only.  
> All credentials go in Cloudflare secrets via `wrangler secret put`.

---

## Before Any Production Deployment

Run the following once per environment (staging, production):

```sh
# Provision a strong comma-separated list of active API keys
# Format: comma-separated, no spaces
# Example: sk_live_abc123,sk_live_def456
wrangler secret put VALID_API_KEYS
# You will be prompted to enter the value — it is not logged or stored in your shell
```

Verify the secret is set:
```sh
wrangler secret list
# Should show: VALID_API_KEYS  (type: secret)
```

The secret value overrides `[vars]` at runtime — the `[vars]` entry serves as documentation of what the var is, not its value.

---

## Key Format

`VALID_API_KEYS` is a comma-separated string of valid API keys:
```
sk_live_abc123,sk_live_def456,sk_live_ghi789
```

The `apiKeyMiddleware` splits on `,` and trims whitespace:
```typescript
const validKeys = new Set(raw.split(',').map(k => k.trim()).filter(Boolean));
```

---

## Key Rotation

1. Generate a new key (use `crypto.randomUUID()` or a secrets manager)
2. Add the new key to the existing secret value (keep old key temporarily)
3. Notify clients of the new key
4. After all clients have migrated, remove the old key
5. Run `wrangler secret put VALID_API_KEYS` with the new value

---

## Secrets Inventory

| Secret | Where set | Rotation frequency | Owner |
|---|---|---|---|
| `VALID_API_KEYS` | `wrangler secret put` | On compromise or quarterly | Ops |
| (future) `STRIPE_WEBHOOK_SECRET` | `wrangler secret put` | On Stripe rotation | Ops |
| (future) `KV_ENCRYPTION_KEY` | `wrangler secret put` | Annual | Ops |

---

## Environment Segregation

| Environment | Key prefix | VALID_API_KEYS source |
|---|---|---|
| Local dev | `dev-*` | `wrangler.toml [vars]` (dev placeholder) |
| Staging | `sk_staging_*` | `wrangler secret put` with staging keys |
| Production | `sk_live_*` | `wrangler secret put` with production keys |

Never use a production key in local dev. Never use a dev key in production.

---

## Future: Cloudflare KV-based Key Store

Once paid-beta is live (BLK-05, BLK-06), API keys should move from `VALID_API_KEYS` env string to a Cloudflare KV namespace. This allows:
- Per-key metadata (customer_id, plan, created_at, revoked_at)
- Key revocation without redeployment
- Self-serve key rotation

The `apiKeyMiddleware` will be updated to call `env.KV.get(key)` instead of splitting a string. The `VALID_API_KEYS` env will be deprecated.

See [API_KEY_PROVISIONING.md](API_KEY_PROVISIONING.md) for the KV key store architecture.

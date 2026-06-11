# VETO Deployment Guide

## Prerequisites

- Node.js 20+
- Wrangler CLI: `npm install -g wrangler` (or use `npx wrangler`)
- Cloudflare account with Workers access
- `wrangler login` completed

## First-time setup

### 1. Set the API keys secret

**Never set VALID_API_KEYS in wrangler.toml [vars] in production.**  
The [vars] block is for non-sensitive defaults (dev only). Use Wrangler secrets for production:

```bash
wrangler secret put VALID_API_KEYS
# When prompted, paste comma-separated keys:
# veto-live-key-abc123,veto-live-key-def456
```

### 2. Verify wrangler.toml

```toml
name = "veto-api"
main = "src/index.ts"
compatibility_date = "2024-11-01"
compatibility_flags = ["nodejs_compat"]

[observability]
enabled = true
```

Observability logs: method, path, status, duration only — no request/response bodies.

### 3. Deploy

```bash
npm run release:check   # must pass
npm run deploy          # wrangler deploy
```

### 4. Verify

```bash
curl https://veto-api.<your-account>.workers.dev/v1/health
curl https://veto-api.<your-account>.workers.dev/v1/version
```

### 5. Custom domain (optional)

In Cloudflare dashboard: Workers → veto-api → Settings → Triggers → Add custom domain  
Set DNS CNAME: `api.veto.dev` → `veto-api.<your-account>.workers.dev`

## Ongoing deployments

```bash
git pull origin main
npm run release:check
npm run deploy
```

## Environment isolation

For staging, add a second worker with `name = "veto-api-staging"` and a separate secret.

## Wrangler version

Pin the Wrangler version in CI (`.github/workflows/ci.yml` uses the project devDependency).  
The current pinned version is in `package.json`.

## Security checklist before each deploy

- [ ] `VALID_API_KEYS` set via secret, not [vars]
- [ ] `npm run release:check` passes
- [ ] No invoice payload logging in source (grep: `c.req.json` never appears in console calls)
- [ ] `wrangler.toml` observability is `enabled = true` (access logs only)

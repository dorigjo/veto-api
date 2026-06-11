# VETO Rollback Procedure

## Trigger criteria

Rollback immediately if any of these occur after a deploy:
- `/v1/health` returns non-200
- `/v1/version` returns wrong engine_version or rule_pack_version
- Any validation endpoint returns 500 on a known-good payload
- Rule decisions change for a previously stable fixture
- Response shape missing required fields

## Rollback via Wrangler

### Option 1: Roll back to previous deployment (fastest)

```bash
wrangler rollback
```

This reverts to the immediately prior deployment in Cloudflare's deploy history.

### Option 2: Roll back to a specific version

List previous deployments:
```bash
wrangler deployments list
```

Roll back to a specific deployment ID:
```bash
wrangler rollback <deployment-id>
```

### Option 3: Redeploy from a previous tag

```bash
git checkout v<previous-version>
npm run release:check
npm run deploy
git checkout main
```

## Verify rollback

```bash
curl https://api.veto.dev/v1/health
curl https://api.veto.dev/v1/version
```

Confirm `engine_version` and `rule_pack_version` match the expected previous values.

## Post-rollback

1. Identify root cause before redeploying
2. Add a regression test for the failure mode
3. Run `npm run release:check` on the fix before proceeding
4. Document the incident in git commit message

## Key facts about Cloudflare Workers rollback

- Cloudflare Workers keep the last ~10 deployments
- Rollback is near-instant (propagates globally in seconds)
- No invoice data is stored — rollback has zero data migration risk
- Secrets (VALID_API_KEYS) are not affected by code rollback

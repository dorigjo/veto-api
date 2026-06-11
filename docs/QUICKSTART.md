# Quickstart — VETO API

Get your first validation result in under 5 minutes.

---

## 1. Get an API Key

Sign up at [veto.dev](https://veto.dev) and copy your API key from the dashboard.

For local development, `dev-key-change-in-production` works out of the box with `wrangler dev`.

---

## 2. Health Check

Confirm the service is reachable:

```bash
curl https://api.veto.dev/v1/health
```

```json
{ "status": "ok", "timestamp": "2024-11-15T10:30:00.000Z" }
```

---

## 3. Check Supported Profiles

```bash
curl https://api.veto.dev/v1/version
```

```json
{
  "engine_version": "0.1.0",
  "rule_pack_version": "2024.1",
  "supported_profiles": ["EN16931", "PEPPOL-BIS-3.0"]
}
```

---

## 4. Validate a Minimal Invoice

```bash
curl -X POST https://api.veto.dev/v1/validate \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "invoice": {
      "invoice_number": "INV-2024-0001",
      "issue_date": "2024-11-15",
      "seller": { "name": "Acme GmbH", "country": "DE" },
      "buyer":  { "name": "Beta Corp S.A.", "country": "FR" },
      "currency": "EUR",
      "total_amount": 1190.00
    },
    "target_profile": "EN16931"
  }'
```

A `VALID` response means all currently active rules passed.

---

## 5. See Errors

Submit an invoice with missing fields:

```bash
curl -X POST https://api.veto.dev/v1/validate \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "invoice": {}, "target_profile": "EN16931" }'
```

The response will list every failing rule in `blocking_errors` and include the full evaluation trail in `trace`.

---

## Run Locally

```bash
git clone https://github.com/your-org/veto-api
cd veto-api
npm install
npm run dev
# API available at http://localhost:8787
```

Use `dev-key-change-in-production` as the API key locally (set in `wrangler.toml [vars]`).

---

## Next Steps

- Read the full [API Reference](API.md)
- Review the [No Storage guarantee](NO_STORAGE.md)
- See [examples/curl.sh](../examples/curl.sh) for more request patterns
- See [examples/node.ts](../examples/node.ts) for a TypeScript integration example

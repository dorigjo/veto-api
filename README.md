# VETO — European E-Invoicing Validation API

**Pre-submission invoice validation API for EN16931, PEPPOL BIS 3.0, and XRechnung 3.0.**

VETO is a stateless, deterministic API that validates electronic invoice data against European e-invoicing standards before submission. One POST request, 50ms, machine-readable errors with remediation hints. No invoice storage. No dashboard. Compliance infrastructure, not consulting.

**Status:** Developer preview — placeholder rules (7/~128+ EN16931 rules). Full schematron validation in development.

---

## Who this is for

ERP, billing, and accounting SaaS developers building European e-invoice output who need to catch compliance errors before submission to a PEPPOL access point or tax portal.

## What it does today

- Validates invoice JSON against EN16931, PEPPOL BIS 3.0, or XRechnung 3.0 profile
- Returns VALID / INVALID / WARNING with full evaluation trace
- Returns machine-actionable `remediation_hint` per error
- Returns `rule_pack_hash` for auditability
- Returns `profile_resolution` showing which rule pack was applied
- Rejects oversized payloads (>1MB) and wrong content-types

## What it does not do yet

- Does not implement full EN16931 schematron (7/128+ rules — see `docs/COMPLIANCE_DISCLAIMER.md`)
- Does not validate against official KoSIT/OpenPEPPOL schematron artefacts
- Does not accept UBL/CII XML input (JSON only)
- Does not submit invoices anywhere
- Does not enforce rate limits (planned v0.4)

---

## Quickstart

```bash
# Get an API key: email hello@veto.dev or visit veto.dev

# Health check (no auth)
curl https://api.veto.dev/v1/health

# Version + supported profiles (no auth)
curl https://api.veto.dev/v1/version

# Validate an invoice
curl -X POST https://api.veto.dev/v1/validate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "invoice": {
      "invoice_number": "INV-2024-0001",
      "issue_date": "2024-11-15",
      "seller": { "name": "Acme GmbH", "country": "DE" },
      "buyer":  { "name": "Beta Corp", "country": "FR" },
      "currency": "EUR",
      "total_amount": 1190.00
    },
    "target_profile": "EN16931"
  }'
```

Response:
```json
{
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "decision": "VALID",
  "deterministic_trace": true,
  "engine_version": "0.2.0",
  "rule_pack_version": "2024.1",
  "rule_pack_hash": "sha256-PLACEHOLDER-2024.1-7rules",
  "target_profile": "EN16931",
  "profile_resolution": {
    "requested": "EN16931",
    "resolved": "EN16931",
    "rule_pack_id": "en16931-2024.1",
    "is_cius": false,
    "base_standard": "EN16931"
  },
  "blocking_errors": [],
  "warnings": [],
  "trace": [...],
  "storage_statement": "No invoice data is stored or logged by this service."
}
```

---

## XRechnung example (German B2G)

```bash
curl -X POST https://api.veto.dev/v1/validate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "invoice": {
      "invoice_number": "XRECH-2024-001",
      "issue_date": "2024-11-15",
      "seller": { "name": "DE Lieferant GmbH", "country": "DE" },
      "buyer": { "name": "Bundesbehörde", "country": "DE" },
      "currency": "EUR",
      "total_amount": 2380.00
    },
    "target_profile": "XRECHNUNG-3.0"
  }'
```

---

## Invalid invoice — see remediation hints

```bash
curl -X POST https://api.veto.dev/v1/validate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"invoice": {"currency": "euros"}, "target_profile": "EN16931"}'
```

Response includes per-error remediation hints:
```json
{
  "decision": "INVALID",
  "blocking_errors": [
    {
      "rule_id": "BR-01",
      "message": "Missing or empty invoice number (invoice_number)",
      "severity": "error",
      "remediation_hint": {
        "hint_type": "missing_field",
        "description": "Add field invoice_number with a non-empty string value, e.g. \"INV-2024-0001\""
      }
    }
  ]
}
```

---

## Node.js example

```typescript
const res = await fetch('https://api.veto.dev/v1/validate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.VETO_API_KEY!,
  },
  body: JSON.stringify({
    invoice: {
      invoice_number: 'INV-2024-001',
      issue_date: '2024-11-15',
      seller: { name: 'Acme GmbH', country: 'DE' },
      buyer: { name: 'Beta Corp', country: 'FR' },
      currency: 'EUR',
      total_amount: 1190.00,
    },
    target_profile: 'EN16931',
  }),
});

const result = await res.json();
if (result.decision === 'INVALID') {
  console.error('Validation failed:', result.blocking_errors);
}
```

---

## Supported profiles

| Profile | Standard | Status |
|---------|----------|--------|
| `EN16931` | CEN/TC 434 European semantic model | Placeholder (7/128+ rules) |
| `PEPPOL-BIS-3.0` | OpenPEPPOL CIUS on EN16931 | Placeholder (same 7 rules) |
| `XRECHNUNG-3.0` | KoSIT German CIUS for B2G | Placeholder (same 7 rules) |

---

## Local development

```bash
npm install
npm run dev          # wrangler dev → localhost:8787
npm run typecheck    # TypeScript check
npm test             # Vitest tests
npm run ci           # typecheck + test + build
npm run release:check  # full pre-release gate
npm run openapi:check  # validate OpenAPI spec structure
```

---

## Deploy to Cloudflare Workers

```bash
# Set production API keys (never put in wrangler.toml [vars])
wrangler secret put VALID_API_KEYS

# Deploy
npm run release:check
npm run deploy
```

See `docs/DEPLOYMENT.md` for full procedure.

---

## Compliance disclaimer

VETO is in developer preview with placeholder rules. The `rule_pack_hash` field contains `PLACEHOLDER` until official EN16931/PEPPOL/XRechnung schematron artefacts are compiled. Do not use as the sole compliance gate for production invoice submission. See `docs/COMPLIANCE_DISCLAIMER.md`.

---

## Documentation

| Doc | Purpose |
|-----|---------|
| [QUICKSTART](docs/QUICKSTART.md) | First API call in 5 minutes |
| [API Reference](docs/API.md) | Full endpoint specification |
| [Integration Guide](docs/INTEGRATION_GUIDE.md) | ERP, billing, PEPPOL patterns |
| [Error Codes](docs/ERROR_CODES.md) | All rule IDs, HTTP codes, remediation hints |
| [FAQ](docs/FAQ.md) | Common questions |
| [Compliance Architecture](docs/COMPLIANCE_ARCHITECTURE.md) | What is real vs placeholder |
| [Compliance Disclaimer](docs/COMPLIANCE_DISCLAIMER.md) | Honest status statement |
| [Official Sources](docs/OFFICIAL_SOURCES.md) | Where rule packs come from |
| [Threat Model](docs/THREAT_MODEL.md) | Security analysis |
| [Security](docs/SECURITY.md) | Auth model, secure headers |
| [No Storage](docs/NO_STORAGE.md) | Privacy guarantees |
| [Deployment](docs/DEPLOYMENT.md) | Cloudflare Workers deploy |
| [Release](docs/RELEASE.md) | Release procedure |
| [Rollback](docs/ROLLBACK.md) | How to roll back |
| [Roadmap](docs/ROADMAP.md) | v0.2–v1.0 roadmap |

---

## License

MIT — see [LICENSE](LICENSE).

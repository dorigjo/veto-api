# VETO — European E-Invoicing Validation API

**Stateless, deterministic validation for EN 16931 and PEPPOL e-invoices.**

VETO is an API-first infrastructure service that validates electronic invoices against the EN 16931 European standard and PEPPOL BIS Billing 3.0 profile. It runs on Cloudflare Workers — globally distributed, sub-10ms cold start, zero operational overhead.

---

## Key Properties

| Property | Detail |
|---|---|
| **Stateless** | No invoice data is stored, logged, or persisted anywhere |
| **Deterministic** | Same input always produces same output; no runtime AI or randomness |
| **Versioned** | Every response includes `engine_version` and `rule_pack_version` |
| **API-first** | JSON in, JSON out — integrate in minutes |
| **Zero infra** | Cloudflare Workers; no servers, no databases, no queues |

---

## Quick Start

```bash
# Validate an invoice
curl -X POST https://api.veto.dev/v1/validate \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
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

```json
{
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "decision": "VALID",
  "engine_version": "0.1.0",
  "rule_pack_version": "2024.1",
  "target_profile": "EN16931",
  "blocking_errors": [],
  "warnings": [],
  "trace": [ "..." ],
  "storage_statement": "No invoice data is stored or logged by this service."
}
```

---

## Supported Profiles

| Profile | Status |
|---|---|
| `EN16931` | Skeleton — placeholder rules |
| `PEPPOL-BIS-3.0` | Skeleton — placeholder rules |

Full rule sets will be added incrementally. See [ROADMAP](docs/ROADMAP.md).

---

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/v1/health` | None | Liveness check |
| `GET` | `/v1/version` | None | Engine and rule-pack versions |
| `POST` | `/v1/validate` | API key | Validate an invoice |

---

## Local Development

```bash
npm install
npm run dev        # wrangler dev at localhost:8787
npm run typecheck  # TypeScript check
npm test           # Vitest unit tests
npm run deploy     # Deploy to Cloudflare Workers
```

---

## Documentation

- [QUICKSTART](docs/QUICKSTART.md) — first API call in 5 minutes
- [API Reference](docs/API.md) — full endpoint specification
- [Security](docs/SECURITY.md) — API key model, threat model, responsible disclosure
- [No Storage](docs/NO_STORAGE.md) — privacy and compliance guarantees
- [Roadmap](docs/ROADMAP.md) — what gets built next
- [Pricing](docs/PRICING.md) — usage-based model
- [Go-to-Market](docs/GTM.md) — ICP, channels, launch strategy
- [AI Automation](docs/AI_AUTOMATION.md) — where AI fits (not in runtime decisions)

---

## License

MIT — see [LICENSE](LICENSE).

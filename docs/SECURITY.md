# Security

## Authentication Model

VETO uses static API keys passed via:

- `X-API-Key: <key>` header (preferred)
- `Authorization: Bearer <key>` header

API keys are stored as a comma-separated list in the Cloudflare Worker secret `VALID_API_KEYS`. They never appear in logs or responses.

### Key Rotation

Keys are managed via Wrangler:

```bash
# Set keys (overwrites current value)
wrangler secret put VALID_API_KEYS
# Enter: key-a,key-b,key-c
```

There is currently no per-key metadata (name, created-at, last-used). Per-key management is on the roadmap.

---

## Threat Model

### What VETO protects against

- Unauthenticated access to the validation endpoint
- Accidental exposure of billing logic to the public internet

### What VETO does NOT protect against (MVP)

- **Compromised API keys** — keys are static; rotate immediately if leaked
- **Rate limiting** — Cloudflare's built-in rate limiting is not configured in the MVP; add via Cloudflare dashboard
- **Abuse/scraping** — no per-key quotas in MVP; planned for v0.2
- **Input size** — no explicit payload size limit beyond Cloudflare's default (100 MB)

### Attack surface

VETO is stateless. There is no database, no file system writes, no session state. The maximum blast radius of a compromise is: an attacker can run validation requests, consuming quota. No data can be exfiltrated because no data is stored.

---

## Transport Security

All traffic is TLS 1.2+ enforced by Cloudflare. VETO does not operate over plain HTTP in production.

Secure headers are applied on every response:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`

---

## Invoice Data Handling

Invoice payloads are:
1. Received in memory on a Cloudflare Worker
2. Parsed and validated against the rule set
3. Immediately discarded — no writes to KV, R2, D1, or any external system

See [NO_STORAGE.md](NO_STORAGE.md) for the full privacy guarantee.

---

## Responsible Disclosure

To report a security vulnerability, email: `security@veto.dev`

Please do not open public GitHub issues for security vulnerabilities.

---

## Compliance Posture

VETO does not process personal data beyond what is embedded in invoice fields (names, addresses). Under GDPR, validation-only processing without storage may qualify as transient processing; consult your DPO for your specific use case.

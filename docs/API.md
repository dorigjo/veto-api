# API Reference

Base URL: `https://api.veto.dev`

All requests and responses use `application/json`.

---

## Authentication

Protected endpoints require an API key. Pass it as:

```
X-API-Key: your-api-key
```

or:

```
Authorization: Bearer your-api-key
```

Missing or invalid keys return `401 Unauthorized`.

---

## GET /v1/health

Liveness check. No authentication required.

**Response 200**

```json
{
  "status": "ok",
  "timestamp": "2024-11-15T10:30:00.000Z"
}
```

---

## GET /v1/version

Returns current engine and rule-pack versions. No authentication required.

**Response 200**

```json
{
  "engine_version": "0.1.0",
  "rule_pack_version": "2024.1",
  "supported_profiles": ["EN16931", "PEPPOL-BIS-3.0"]
}
```

---

## POST /v1/validate

Validate an invoice payload against a target profile.

**Authentication:** Required (`X-API-Key` or `Authorization: Bearer`)

### Request Body

```json
{
  "invoice": {
    "invoice_number": "INV-2024-0001",
    "issue_date": "2024-11-15",
    "seller": {
      "name": "Acme GmbH",
      "country": "DE"
    },
    "buyer": {
      "name": "Beta Corp S.A.",
      "country": "FR"
    },
    "currency": "EUR",
    "total_amount": 1190.00
  },
  "target_profile": "EN16931",
  "options": {
    "strict": false
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `invoice` | object | Yes | Invoice data to validate |
| `invoice.invoice_number` | string | — | Unique invoice identifier |
| `invoice.issue_date` | string | — | Issue date (any non-empty string; future: ISO 8601) |
| `invoice.seller.country` | string | — | ISO 3166-1 alpha-2 seller country code |
| `invoice.buyer.country` | string | — | ISO 3166-1 alpha-2 buyer country code |
| `invoice.currency` | string | — | ISO 4217 three-letter currency code (e.g. `EUR`) |
| `invoice.total_amount` | number | — | Total payable amount |
| `target_profile` | string | Yes | Validation profile — `EN16931` or `PEPPOL-BIS-3.0` |
| `options.strict` | boolean | — | Reserved for future use |

### Response 200

```json
{
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "decision": "VALID",
  "engine_version": "0.1.0",
  "rule_pack_version": "2024.1",
  "target_profile": "EN16931",
  "blocking_errors": [],
  "warnings": [],
  "trace": [
    {
      "rule_id": "BR-01",
      "passed": true,
      "severity": "error",
      "description": "Invoice must contain an invoice number"
    }
  ],
  "storage_statement": "No invoice data is stored or logged by this service."
}
```

| Field | Type | Description |
|---|---|---|
| `request_id` | string (UUID) | Unique identifier for this validation request |
| `decision` | `VALID` \| `INVALID` \| `WARNING` | Overall validation outcome |
| `engine_version` | string | Validation engine semver |
| `rule_pack_version` | string | Active rule pack version |
| `target_profile` | string | Profile used for validation |
| `blocking_errors` | array | Rules that failed with severity `error` |
| `warnings` | array | Rules that failed with severity `warning` |
| `trace` | array | Full evaluation trail for every rule checked |
| `storage_statement` | string | Privacy guarantee statement |

### Decision Logic

| Condition | Decision |
|---|---|
| Unsupported `target_profile` | `INVALID` (rule `VT-01`) |
| One or more blocking errors | `INVALID` |
| No errors, one or more warnings | `WARNING` |
| All rules passed | `VALID` |

### Active Rules

| Rule ID | Severity | Description |
|---|---|---|
| `VT-01` | error | Unsupported target profile |
| `BR-01` | error | Missing invoice number |
| `BR-02` | error | Missing issue date |
| `BR-04` | error | Missing seller country |
| `BR-07` | error | Missing buyer country |
| `BR-09` | error | Missing total amount |
| `BR-CL-04` | error | Invalid currency format (must be ISO 4217 3-letter code) |
| `BR-DEC-01` | warning | Total amount is negative |

### Error Responses

| Status | Meaning |
|---|---|
| `400` | Invalid JSON or missing required fields |
| `401` | Missing or invalid API key |
| `404` | Endpoint not found |
| `500` | Unexpected internal error |

---

## Versioning

The API is versioned via URL prefix (`/v1`). Breaking changes will increment the version. The `rule_pack_version` in every response allows you to detect when rules have changed without a breaking API change.

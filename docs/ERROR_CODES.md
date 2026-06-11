# VETO Error Codes Reference

## HTTP Status Codes

| Status | Meaning | Response Body |
|--------|---------|---------------|
| 200 | Validation executed (decision may be VALID, INVALID, or WARNING) | `ValidationResponse` |
| 400 | Malformed request (invalid JSON, missing required fields) | `{ error, details? }` |
| 401 | Missing or invalid API key | `{ error, hint? }` |
| 413 | Request body too large (>1MB) | `{ error, max_bytes }` |
| 415 | Wrong Content-Type (must be application/json) | `{ error, received }` |
| 404 | Unknown endpoint | `{ error }` |
| 500 | Internal server error | `{ error }` |

---

## Validation Rule IDs

### System rules (VT-xx)

| Rule ID | Meaning | Remediation |
|---------|---------|-------------|
| VT-01 | Unsupported target_profile | Use one of: `EN16931`, `PEPPOL-BIS-3.0`, `XRECHNUNG-3.0` |

### EN16931 base rules (BR-xx)

| Rule ID | Severity | Field | Meaning | Remediation |
|---------|----------|-------|---------|-------------|
| BR-01 | error | invoice_number | Missing or empty | Add non-empty `invoice_number` string |
| BR-02 | error | issue_date | Missing or empty | Add `issue_date` as ISO 8601, e.g. `"2024-11-15"` |
| BR-04 | error | seller.country | Missing or empty | Add `seller.country` as ISO 3166-1 alpha-2, e.g. `"DE"` |
| BR-07 | error | buyer.country | Missing or empty | Add `buyer.country` as ISO 3166-1 alpha-2, e.g. `"FR"` |
| BR-09 | error | total_amount | Missing or non-numeric | Add `total_amount` as a finite number |
| BR-CL-04 | error | currency | Invalid format | Use ISO 4217 three-letter code, e.g. `"EUR"` |
| BR-DEC-01 | warning | total_amount | Negative value | Verify: credit notes may have negative amounts; confirm intent |

---

## Decision values

| Decision | Meaning |
|----------|---------|
| `VALID` | All rules passed. No blocking errors, no warnings. |
| `WARNING` | No blocking errors, but at least one warning rule triggered. |
| `INVALID` | One or more blocking error rules triggered. Invoice should not be submitted. |

---

## Remediation hint types

| hint_type | Meaning |
|-----------|---------|
| `missing_field` | A required field is absent or empty |
| `invalid_code` | A code list field contains an invalid or unrecognized value |
| `unsupported_profile` | The requested `target_profile` is not implemented |
| `transformable_gap` | The value may be valid in context but needs confirmation |
| `authority_profile_mismatch` | The invoice format doesn't match the requested profile authority |

---

## Example: INVALID response with remediation hints

```json
{
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "decision": "INVALID",
  "deterministic_trace": true,
  "engine_version": "0.2.0",
  "rule_pack_version": "2024.1",
  "rule_pack_hash": "sha256-PLACEHOLDER-2024.1-7rules",
  "target_profile": "EN16931",
  "profile_resolution": {
    "requested": "EN16931",
    "resolved": "EN16931",
    "rule_pack_id": "en16931-2024.1",
    "rule_pack_hash": "sha256-PLACEHOLDER-en16931-2024.1",
    "is_cius": false,
    "base_standard": "EN16931"
  },
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
  ],
  "warnings": [],
  "trace": [...],
  "storage_statement": "No invoice data is stored or logged by this service."
}
```

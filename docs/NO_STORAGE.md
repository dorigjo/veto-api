# No Storage Guarantee

## What This Means

VETO never stores, logs, or forwards any part of your invoice payload.

Every validation request is:

1. **Received** by a Cloudflare Worker in ephemeral memory
2. **Parsed** — Zod validates the request shape
3. **Evaluated** — the rule engine runs deterministically against the in-memory payload
4. **Responded** — the result is returned as JSON
5. **Discarded** — the Worker process may be recycled at any time; no state survives

There is no database write. No KV store write. No R2 bucket write. No external API call that forwards invoice data. No structured log that captures invoice fields.

---

## What Is Logged

Cloudflare Workers observability (if enabled) may log:
- HTTP method and path (`POST /v1/validate`)
- Response status code
- Request duration
- Worker CPU time

Invoice fields, `request_id`, and validation results are **not** included in platform logs.

---

## Architectural Proof

The codebase has no:
- Database client imports
- External HTTP calls from the validate route
- File system writes
- Cache writes keyed on invoice content

You can verify this by reading `src/routes/validate.ts` and `src/rules/engine.ts`. The entire execution path is: parse → run rules → return JSON.

---

## Storage Statement in Every Response

Every `/v1/validate` response includes:

```json
"storage_statement": "No invoice data is stored or logged by this service."
```

This field exists specifically so that integrating systems can log or display the guarantee to their own users.

---

## Future Roadmap Consideration

If audit logging (storing validation outcomes without invoice content) is added in a future version, it will be:
- Opt-in per API key
- Clearly versioned and documented
- Limited to metadata only (request ID, decision, timestamp, rule IDs)
- Never including raw invoice fields

Any change to this guarantee will constitute a major version bump and will require explicit opt-in from customers.

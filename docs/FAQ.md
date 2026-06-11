# VETO FAQ

## What does VETO do?

VETO is a pre-submission e-invoicing validation API. You send it an invoice payload, it checks it against EN16931 / XRechnung / PEPPOL BIS rules, and tells you whether it's VALID, INVALID, or has WARNINGs — before you submit it to a tax authority or PEPPOL network.

## What does VETO NOT do?

- Does not store invoices
- Does not submit invoices to anyone
- Does not act as a PEPPOL Access Point
- Does not generate invoices
- Does not provide accounting or legal advice
- Does not have a dashboard, login UI, or web application
- Does not use AI to make compliance decisions

## Is VETO fully EN16931 compliant?

No. Not yet. The current version (v0.2.0) implements 7 placeholder rules covering ~5% of mandatory EN16931 validation. The full rule set requires official schematron artefacts from CEN/TC 434, which are being integrated. The `rule_pack_hash` in every response contains `PLACEHOLDER` when using pre-schematron rules. See `docs/COMPLIANCE_DISCLAIMER.md`.

## What profiles does VETO support?

- `EN16931` — European e-invoicing semantic data model
- `PEPPOL-BIS-3.0` — PEPPOL BIS Billing 3.0 (extends EN16931)
- `XRECHNUNG-3.0` — German CIUS for public sector B2G invoices

## Do you store my invoice data?

No. Invoices are processed in memory and discarded after the response. No database, no logs of invoice content, no storage bindings. Every response includes `storage_statement: "No invoice data is stored or logged by this service."` as a machine-readable confirmation.

## What format do invoices need to be in?

VETO accepts invoice data as a JSON object. This is the pre-document representation, not the final UBL 2.1 or CII XML document. You validate the data before generating the XML. This is intentional — it's faster and simpler to validate the source data than parse a generated XML document.

## Can I use VETO to validate UBL XML?

Not yet. JSON-based invoice data only in the current version. UBL/CII XML input support is on the roadmap for v0.4.

## Why is the API stateless?

Statelessness means your data never persists on VETO's infrastructure. This eliminates GDPR data-subject-request risk, storage breach risk, and data retention compliance overhead. It also means VETO can scale horizontally on Cloudflare Workers with zero state management.

## What happens if I send a large invoice?

Requests over 1MB return HTTP 413. Legitimate invoices are small (typically under 10KB of JSON data). If you're hitting 1MB, check for accidental binary attachment encoding in the payload.

## Can I use this for credit notes?

Yes. Credit notes with negative `total_amount` will receive a `WARNING` (BR-DEC-01) rather than an error, because credit notes legitimately have negative totals. The warning is informational.

## What is `rule_pack_hash` for?

It's a stable identifier for the exact version of validation rules used. If the rule pack changes (bug fix, new schematron artefact), the hash changes. You can store this alongside your validation result to know exactly which rules were applied. Currently contains `PLACEHOLDER` until real schematron artefacts are compiled.

## How do I get an API key?

Email hello@veto.dev or visit veto.dev. During developer preview, keys are issued manually.

## Is there rate limiting?

Not yet enforced. Planned for v0.4. During developer preview, use reasonably (max ~100K validations/month per key).

## What is the `deterministic_trace` field?

When `true`, it means the validation result is reproducible: the same input will always produce the same output (except for `request_id`, which is always unique). This is a guarantee of the VETO architecture — no randomness, no AI, no probabilistic decisions.

## Can I use VETO in production today?

For integration testing and developer preview: yes. As the sole compliance gate for live invoice submission to tax authorities: not yet. Combine VETO with an official validator until full schematron implementation is complete. See `docs/COMPLIANCE_DISCLAIMER.md`.

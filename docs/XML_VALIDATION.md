# XML Validation

**Status:** Not implemented  
**Current input format:** JSON only

---

## Current State

VETO currently accepts invoices as JSON objects. The JSON schema maps to a subset of the UBL 2.1 invoice data model. This is intentional for Phase 1 — JSON APIs are easier to integrate for ERP systems without native UBL support.

---

## Why XML Matters

EN16931 and PEPPOL are defined over two XML syntaxes:

| Syntax | Standard | Use case |
|---|---|---|
| UBL 2.1 (OASIS) | EN16931, PEPPOL BIS 3.0, XRechnung | Dominant in EU B2B/B2G |
| UN/CEFACT CII (Cross-Industry Invoice) | EN16931, XRechnung | Used in France (Factur-X/ZUGFeRD), embedded PDF |

The official schematron artefacts validate UBL or CII XML documents — not JSON. This creates a gap: to run official schematron rules, VETO either:

1. **Compiles schematron to JSON-path rules** (current architecture — see `SCHEMATRON_DECISION_RECORD.md`)
2. **Accepts UBL/CII XML directly** and runs native schematron

---

## Decision: JSON-first with XML roadmap

**Phase 1 (current):** Accept JSON. Map JSON fields to EN16931 semantic elements at compile time.  
**Phase 2:** Accept UBL 2.1 XML. Parse to internal model. Run same compiled rule functions.  
**Phase 3:** Accept CII XML (Factur-X / ZUGFeRD). Parse to internal model.

### Why JSON-first?

1. Cloudflare Workers V8 isolate has no native XML parser
2. Node.js `DOMParser` is not available in CF Workers without polyfill
3. Adding an XML parser adds 50–200 KB to the bundle (problematic for cold start)
4. Most modern ERP API integrations produce JSON, not raw UBL XML
5. Schematron rules can be compiled to pure TypeScript that operates on structured data

### XML parsing in CF Workers

When XML input is added, the parser must be:
- Pure JavaScript (no native bindings)
- Lightweight (< 100 KB)
- XPath-free at runtime (all XPath resolved at compile time)

Candidate: `fast-xml-parser` (MIT, ~40 KB minified). Evaluate bundle size impact before committing.

---

## UBL 2.1 to JSON Mapping

The current JSON schema maps as follows:

| JSON field | UBL 2.1 element | EN16931 BT |
|---|---|---|
| `invoice_number` | `cbc:ID` | BT-1 |
| `issue_date` | `cbc:IssueDate` | BT-2 |
| `seller.name` | `cac:AccountingSupplierParty/cac:Party/cac:PartyName/cbc:Name` | BT-27 |
| `seller.country` | `cac:AccountingSupplierParty/.../cbc:IdentificationCode` | BT-40 |
| `buyer.name` | `cac:AccountingCustomerParty/cac:Party/cac:PartyName/cbc:Name` | BT-44 |
| `buyer.country` | `cac:AccountingCustomerParty/.../cbc:IdentificationCode` | BT-55 |
| `currency` | `cbc:DocumentCurrencyCode` | BT-5 |
| `total_amount` | `cac:LegalMonetaryTotal/cbc:PayableAmount` | BT-115 |

---

## Security Considerations for XML Input

When XML input is implemented:

1. **XXE (XML External Entity) injection:** The parser must be configured to reject external entities. `fast-xml-parser` is safe by default (no external entity support).

2. **Billion Laughs (XML bomb):** Limit entity expansion depth. The 1 MB body limit prevents most bombs, but the parser should also have a node-count limit.

3. **Oversized attributes:** Already handled by the `bodyLimit` 1 MB guard.

4. **Namespace confusion attacks:** Reject documents with unexpected namespace prefixes for `cbc:` / `cac:`.

---

## Roadmap

- Phase 2 target: after BLK-01 (EN16931 schematron) is resolved
- Phase 3 target: when first German B2G customer requires Factur-X / ZUGFeRD input
- No commitment to a specific timeline until Phase 1 is complete

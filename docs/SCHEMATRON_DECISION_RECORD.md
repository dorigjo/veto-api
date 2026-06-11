# Schematron Integration Decision Record

**Decision date:** 2024-11  
**Status:** Architecture decided, implementation pending (BLK-01)

---

## Context

EN16931, PEPPOL BIS 3.0, and XRechnung 3.0 validation rules are published as ISO Schematron 2016 XML files. Each `<sch:assert>` expresses a business rule using XPath 2.0 or 3.1 predicates.

VETO runs on Cloudflare Workers V8 isolates. V8 isolates do not support:
- Node.js built-ins (`child_process`, `fs`, etc. — only `nodejs_compat` flag for a limited subset)
- Saxon (Java-based XSLT/XPath 2.0 processor)
- `DOMParser` / XPath evaluation (no native XML parser in Workers)

This means schematron cannot be evaluated at request time in a CF Workers environment.

---

## Decision: Compile-time Schematron → TypeScript

**We compile Schematron to TypeScript functions at build time, not at request time.**

Each Schematron `<sch:assert>` becomes a TypeScript function:

```typescript
// Source Schematron rule (EN16931):
// <sch:assert test="cbc:ID" id="BR-01" flag="fatal">
//   [BR-01]-An Invoice shall have a Specification identifier (BT-24).
// </sch:assert>

// Compiled TypeScript rule:
export const BR_01: Rule = {
  rule_id: 'BR-01',
  severity: 'error',
  description: 'An Invoice shall have a Specification identifier (BT-24)',
  evaluate: (invoice: InvoicePayload): boolean => {
    return typeof invoice.specification_identifier === 'string' &&
           invoice.specification_identifier.length > 0;
  },
};
```

The XPath expressions are translated by `scripts/rules/compile-rule-pack.ts` into pure TypeScript/JavaScript property access chains and comparisons.

---

## Why Not Run Schematron Natively?

| Approach | Pros | Cons |
|---|---|---|
| Compile-time to TS (chosen) | V8-compatible, zero cold start penalty, type-safe | Build step needed, XPath translation gaps |
| Saxon via WASM | Runtime accuracy, no translation | WASM binary ~15 MB (Workers limit 10 MB), cold start 1–2s |
| External validation microservice | Clean separation | Network hop per request, latency, cost, failure mode |
| Node.js Lambda / Fargate | Full XPath 2.0 support | Not serverless, higher latency, cost |
| CF Worker with custom XPath engine | Stays on CF | No production-quality pure-JS XPath 2.0 engine exists |

**WASM Saxon:** The Worker bundle limit is 10 MB (free tier) / 10 MB (paid tier). Saxon-HE WASM is ~15 MB. This is a hard blocker.

**External microservice:** Introduces network latency (~10–50 ms) and a single point of failure. VETO's value proposition is zero-latency pre-submission validation — adding a network hop defeats the purpose.

**Compile-time to TS:** The only viable path. XPath complexity is the risk (see below).

---

## XPath Translation Risk Assessment

| XPath pattern | Translateability | Notes |
|---|---|---|
| `cbc:ID` (presence check) | Easy | `invoice.id !== undefined` |
| `string-length(normalize-space(cbc:ID)) > 0` | Easy | `invoice.id?.trim().length > 0` |
| `number(cbc:LineExtensionAmount) > 0` | Medium | `parseFloat(invoice.line_amount) > 0` |
| `cbc:TaxCategoryCode = ('S', 'Z', 'E', 'AE', 'K', 'G', 'O')` | Medium | `['S','Z','E','AE','K','G','O'].includes(code)` |
| `every $i in ... satisfies ...` | Hard | Translate to `Array.every()` |
| `matches(cbc:ID, '^[A-Z0-9]{2}$')` | Easy | RegExp |
| `sum(...)` aggregation | Hard | Map-reduce over line items |
| Cross-document XPath (e.g., ATT references) | Very hard | May require runtime data structure |

**Estimated translatable rules for EN16931:** ~95% of the 134 rules are straightforward XPath that maps cleanly to TypeScript. The remaining ~5% require careful manual review.

---

## Schematron Compiler Architecture

```
rules/artefacts/EN16931/1.3.13/EN16931-UBL-validation.sch
    │
    ▼
scripts/rules/compile-rule-pack.ts
    │
    ├── Parse XML (fast-xml-parser at build time — Node.js context, not CF Workers)
    ├── Extract all <sch:assert> and <sch:report> elements
    ├── For each rule:
    │     ├── Parse XPath expression
    │     ├── Translate XPath to TypeScript expression
    │     ├── Generate rule function with id, severity, description
    │     └── Write to src/rules/compiled/en16931-rules.ts
    │
    ├── Compute SHA-256 of output file
    ├── Update src/rules/rule-pack-manifest.ts:
    │     is_placeholder = false
    │     artifact_hash = sha256:<hash>
    │     rules_count = N
    └── Regenerate release-status.json
```

---

## Testing Strategy

1. **Unit tests per rule** — each compiled rule gets at least one positive and one negative test case
2. **Official fixture tests** — run all official test invoices from the CEN/TC 434 repository against compiled rules; compare outcomes to expected results
3. **Regression tests** — after each artefact update, diff the compiled output and require explicit approval for rule changes
4. **Determinism tests** — same invoice → same output, always (already in `test/determinism.test.ts`)

---

## Implementation Timeline Estimate

| Step | Effort |
|---|---|
| Write XPath → TS translator (core patterns) | 3–5 days |
| Compile EN16931 134 rules | 1–2 days |
| Write official fixture tests | 1 day |
| Fix translation gaps (edge cases) | 1–2 days |
| Compile PEPPOL BIS 3.0 additional rules | 1–2 days |
| Compile XRechnung 3.0 CIUS rules | 1 day |
| **Total estimate** | **8–12 days** |

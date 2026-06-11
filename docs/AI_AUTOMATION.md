# AI Automation Strategy

## Principle

AI is used to reduce maintenance burden on the operator, not to make compliance decisions at runtime.

**VETO's validation is deterministic.** The rule engine applies fixed, versioned rules to invoice data. The outcome of any validation request is fully reproducible from the input. No language model makes or influences compliance decisions.

---

## Where AI Will Be Used (Planned)

### 1. Rule Pack Diffing

When EN 16931 or PEPPOL specification documents are updated, an AI pipeline will:
- Compare the new document against the current rule pack
- Flag candidate rule changes for human review
- Generate a diff report and draft a changelog entry

Human review is required before any rule change ships.

### 2. Official Source Monitoring

An automated agent will periodically:
- Monitor the CEN/TC 434 publications page for EN 16931 updates
- Monitor the PEPPOL Authority (OpenPeppol) release notes
- Monitor national CIUS publications (XRechnung, etc.)
- Post a summary to a private Slack/email digest

This is an alert system, not a compliance decision system.

### 3. Test Fixture Generation

Given a set of rule changes, an AI pipeline will draft:
- New test fixtures that exercise the changed rules
- Edge case invoice payloads that stress-test boundary conditions
- Regression test cases for rules that must not change behavior

All generated fixtures are reviewed and committed by the maintainer.

### 4. Documentation Generation

When rule packs are updated, AI will:
- Draft updates to `docs/API.md` (new rules table rows)
- Draft changelog entries
- Draft migration guides for breaking rule changes

Output is always human-reviewed before publication.

### 5. Support Answer Drafting

For common support questions (integration issues, error message clarification), an AI assistant will:
- Draft a suggested reply based on the documentation
- Present it to the operator for review and send

No AI system responds to customers autonomously.

### 6. Regression Test Expansion

As real-world invoice samples are submitted by beta customers (with explicit consent and PII removal), AI will suggest additional test cases that cover observed edge cases.

---

## Where AI Will NOT Be Used

### Runtime Compliance Decisions

The validation engine will never call an LLM during request handling. Reasons:

1. **Determinism** — Compliance requires reproducibility. "The AI said VALID" is not a legal defense.
2. **Latency** — LLM inference adds 200ms–2s; unacceptable for synchronous API calls.
3. **Cost** — At scale, per-token LLM cost would exceed the entire revenue margin.
4. **Auditability** — Rules must be inspectable, versioned, and explainable.
5. **Reliability** — Model outputs can vary; rules must not.

### Automatic Rule Pack Deployment

Even if AI detects a specification change, no rule update is deployed without human review and explicit version bump.

---

## Implementation Timeline

| Feature | When |
|---|---|
| Source monitoring digest | v0.3 |
| Fixture generation pipeline | v0.4 |
| Rule diff assistant | v0.5 |
| Support draft assistant | v0.4 |
| Docs generation pipeline | v0.5 |

All AI automation runs offline (not on the request path) and is operator-only tooling. It is not a customer-facing feature.

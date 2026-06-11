# AI Automation Policy — Model-Agnostic

## Principle

AI coding assistants and LLMs accelerate development. VETO uses them aggressively for build-time tasks. They are categorically forbidden from runtime compliance decisions.

This policy is model-agnostic — it applies to Claude Code, OpenAI Codex, GitHub Copilot, Gemini, or any future AI tool.

---

## Permitted AI use (build-time only)

| Task | When | Acceptable models |
|------|------|------------------|
| Writing TypeScript rule implementations | During development | Any |
| Generating test fixtures | During development | Any |
| Drafting documentation | During development | Any |
| Researching EN16931/PEPPOL/XRechnung rule specs | During development | Any, with human verification |
| Writing changelog entries | On release | Any |
| Drafting support email templates | As needed | Any |
| Reviewing OpenAPI spec for correctness | During development | Any |
| Diffing rule pack versions | On upstream update | Any |
| Generating error code descriptions | During development | Any |

---

## Prohibited AI use (never at runtime)

| Task | Why prohibited |
|------|---------------|
| Deciding if an invoice is VALID/INVALID | Non-deterministic, not auditable, no authoritative basis |
| Interpreting ambiguous rule predicates | LLM interpretation ≠ schematron ground truth |
| Selecting which rules apply to an invoice | Profile selection must be deterministic code, not inference |
| Generating rule content from invoice content | Rule logic must come from official standards bodies |
| Responding to customer support in real-time | Creates liability; responses must be human-reviewed |

---

## How AI tools are used in this repo

### Claude Code (primary)

Used for: scaffold generation, refactoring, documentation, test writing, rule research.

All AI-generated code is:
1. Reviewed by the founder before commit
2. Tested by the existing test suite
3. Subject to `npm run release:check` before deployment

### No vendor lock-in

The build-time AI toolchain is interchangeable. Claude Code, Copilot, Codex, or manual coding produce the same output — TypeScript that passes `npm run typecheck && npm test`.

AI tool selection does not affect the runtime product.

---

## The line

```
Build time: AI is welcome
Runtime (validation decision path): AI is forbidden
```

This line is drawn in `src/rules/engine.ts` and `src/rules/rules.ts`. Those files contain deterministic TypeScript only. No LLM calls, no probabilistic logic, no network calls.

---

## Why this matters for customers

Customers need to know that VETO's VALID/INVALID decision is:
1. Reproducible (same input → same output, always)
2. Traceable (every rule decision is in `trace`)
3. Source-attributed (every rule has an official standard origin)
4. Audit-ready (rule_pack_hash identifies which rules ran)

An LLM in the validation path destroys all four properties.

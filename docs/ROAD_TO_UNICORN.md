# Road to Unicorn ($1B valuation)

**Honest probability: 1–3%.**

Read this document for strategic clarity, not motivation.  
The $1B scenario requires specific conditions that may not materialize.  
Design the business to be excellent at $10M ARR; let the unicorn scenario be a free option.

---

## The unicorn thesis

E-invoicing compliance becomes critical infrastructure for every business in Europe.  
25 EU member states, each with a mandate, each with PEPPOL access points, each with domestic CIUS.  
Every B2B and B2G invoice in Europe passes through some form of validation.  
Volume: hundreds of billions of invoices annually.

If VETO becomes the dominant validation layer — the Stripe for invoice compliance — the math works.

---

## The scenarios

### Scenario A: Infrastructure layer ($1B, probability ~1.5%)

VETO becomes the de facto pre-submission validation API for European B2B invoicing.  
Analogies: Twilio for SMS, Stripe for payments, Plaid for banking.

**Requirements:**
- 10+ country CIUS implementations (DE, FR, IT, NL, BE, AT, ES, SE, FI, NO)
- Both UBL and CII syntax support
- 99.99% uptime SLA
- SOC 2 Type II certification
- 1M+ validations/day
- Enterprise contracts with PEPPOL access points as infrastructure customers

**Revenue model at this scale:**
- 10,000 customers × €500/month average = €60M ARR
- 100 enterprise customers × €10,000/month = €12M ARR
- Infra contracts with PEPPOL ISPs: €20M ARR
- Total: ~€92M ARR → ~$1B valuation at 10x revenue

**Timeline:** 6–10 years.

### Scenario B: Acquisition ($200M–$500M, probability ~5%)

A company in one of these categories acquires VETO:
- Tax automation (Vertex, Avalara, TaxJar)
- ERP platforms (SAP, Oracle, Sage, Xero)
- B2B payment infrastructure (Stripe, Adyen, Stripe Treasury)
- PEPPOL access points going global

Acquisition thesis: faster to buy the compliance layer than build it.  
VETO's value: deterministic validation engine + rule pack + official artefact pipeline.  
Acquisition trigger: reaching €2M–€5M ARR with strong NRR.

**Timeline:** 3–6 years.

---

## What has to be true for Scenario A

1. VETO ships real schematron validation for all 3 major profiles (EN16931, PEPPOL, XRechnung) ← achievable within 18 months
2. EU mandates accelerate (France 2026, Belgium 2026, Spain 2025) ← happening
3. VETO expands to 10+ country CIUS implementations ← requires capital or co-founder
4. VETO achieves 99.99% uptime with published SLA ← Cloudflare Workers can deliver this
5. VETO becomes known as the standard validator in the PEPPOL ecosystem ← requires 3-4 years of trust building
6. No well-capitalized competitor dominates first ← real risk

---

## What stops it

**The most realistic killer:** A well-funded competitor (Pagero, Basware, Tungsten/Tungsten Network, or a new company) decides to enter API-first validation and outspends VETO on go-to-market.

**Second most realistic:** The EU creates an official free validation service (they've discussed it; unlikely to be developer-friendly but could undercut commodity pricing).

**Third:** Mandate delays reduce urgency; VETO doesn't reach critical mass before founder runs out of runway.

---

## What to optimize for right now

Do NOT optimize for the unicorn scenario.  
Optimize for: first paying customer → €10K MRR → €100K ARR → product-market fit.

The unicorn scenario is a consequence of excellent product-market fit, not a goal to optimize toward.

**If you're reading this as a solo founder:**  
Build the best EN16931 validator in the world.  
Get 100 paying customers who love it.  
The rest will follow or won't — but you'll have a real business either way.

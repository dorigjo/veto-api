# Road to €1M ARR

€1M ARR = €83,333 MRR.

**Honest probability: 25–40%** given full execution of the compliance roadmap.  
**Timeline: 2–4 years** from first paying customer.

---

## The business model at €1M ARR

At €1M ARR, the customer base looks like one of:
- 700 Starter customers at €119/month (repriced from €29)
- 200 Growth customers at €415/month (repriced from €149)
- 80 Scale customers at €1,041/month
- Or: 30 enterprise customers at €2,778/month average

**Most likely:** Bifurcated customer base.  
- Long tail of 300–500 SME customers at €49–€149/month = €300K ARR
- Enterprise layer of 20–40 customers at €1,000–€5,000/month = €700K ARR

---

## What has to be true to reach €1M ARR

### Product (non-negotiable)
1. Full EN16931 schematron validation, passing official KoSIT/OpenPEPPOL golden fixtures
2. PEPPOL BIS Billing 3.0 fully validated
3. XRechnung 3.0 CIUS fully validated
4. 99.9%+ uptime SLA published
5. API versioning that doesn't break customer integrations
6. <100ms P95 validation latency globally

### Market
1. Regulatory mandates accelerating (Germany 2025 B2B, France 2026, Belgium 2026)
2. PEPPOL network expansion driving SME adoption
3. ERP/billing SaaS consolidating on compliance APIs vs. building in-house

### Sales
1. At least 3–5 lighthouse enterprise customers >€1K MRR each
2. Content/SEO driving organic developer signups
3. PEPPOL access point partnerships (reseller/referral channel)

---

## The pricing unlock

**€1M ARR requires repricing.**

Current Starter at €29/month: €348 ARR per customer.  
At €1M ARR with only Starter customers: 2,874 customers.  
2,874 customers on a solo operation: operationally impossible.

**The path:** Move upmarket.
- Raise Starter to €49–€99 once real schematron ships
- Focus acquisition on Growth/Scale customers
- Enterprise contracts at €2K–€10K/month
- Target 100–200 total customers, not 2,000

---

## Growth levers (in priority order)

1. **Regulation-driven inbound** — every new mandate announcement drives searches for "XRechnung validation API"
2. **Content SEO** — rank for "peppol bis validation", "en16931 nodejs", "xrechnung typescript"
3. **PEPPOL ecosystem** — access points, service providers, ISPs using VETO as infrastructure layer
4. **Partner channel** — ERP consultancies recommending VETO to clients (no rev share needed at this stage)
5. **Enterprise outbound** — direct to CTOs of €10M+ revenue ERP companies

---

## What kills this before €1M ARR

1. **Big Tech enters** — AWS/Azure/Google adds e-invoice validation to their compliance suites. Risk: medium. Mitigation: be the specialist they can't commoditize; publish the fastest, most complete schematron coverage.

2. **Regulation stalls** — mandate delays reduce urgency. Risk: high (EU mandates regularly slip). Mitigation: build for urgency, not hope; expand to more markets (Italy, Spain, Belgium).

3. **Customer builds in-house** — enough customers hire compliance engineers instead of buying. Risk: low for SMEs (too expensive). Medium for large enterprises. Mitigation: price significantly below build cost.

4. **OpenPEPPOL releases free SaaS validator** — Risk: low (they're a standards body, not a SaaS business). Mitigation: differentiate on API-first, stateless, developer experience.

5. **Founder burns out before product ships** — Risk: high on solo builds. Mitigation: no-human-ops policy limits ongoing overhead; full schematron as single milestone unlocks growth.

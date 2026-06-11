# Road to €10K MRR

## The math

€10K MRR requires approximately:
- 345 Starter customers at €29/month, OR
- 67 Growth customers at €149/month, OR
- Mix: 50 Starter + 30 Growth + 2 Scale = ~€7,450 + realistic

**Realistic target:** 60 customers averaging €167 MRR = €10,000.

---

## Timeline

**Month 0–1: Foundation (now)**
- [ ] Deploy v0.2.0 to Cloudflare Workers
- [ ] Public GitHub repo with good README
- [ ] Developer free tier (1K validations/month, no credit card)
- [ ] Show HN post with honest "developer preview" framing
- [ ] Respond to every comment

**Month 1–2: First signal**
- [ ] 50 discovery conversations with target ICP
- [ ] 5–10 manual beta keys issued to interested developers
- [ ] Collect: what breaks, what's missing, what they'd pay for
- [ ] Ship highest-pain missing rules (EN16931 date validation, country code validation)

**Month 2–3: First revenue**
- [ ] Stripe integration (v0.4)
- [ ] Self-serve plan selection
- [ ] First paying customer target: 10 × €29 = €290 MRR
- [ ] Activation: get each customer to first 100 validations

**Month 3–6: Climb**
- [ ] Content marketing: "How to validate EN16931 invoices in Node.js" (rank for long-tail)
- [ ] 50 outbound cold emails/week targeting ERP SaaS CTOs
- [ ] Target: 1–2 new customers/week
- [ ] Ship XRechnung CIUS rules (KoSIT schematron)
- [ ] Reach: 50 customers, €2,900 MRR

**Month 6–12: Acceleration**
- [ ] Ship PEPPOL BIS full schematron
- [ ] Raise Starter to €49/month (announce 30 days ahead, grandfather existing)
- [ ] Growth customers: target ERP platforms processing >100K invoices/month
- [ ] Add annual plan option (20% discount)
- [ ] Target: 80 customers, €8,000 MRR

**Month 10–14: €10K**
- [ ] 90–100 customers averaging €100–€170 MRR
- [ ] Net revenue retention >105% (expansion > churn)
- [ ] CAC < €100 (mostly organic + content)
- [ ] €10,000 MRR milestone

---

## The critical path

The single most important thing: **shipping full EN16931 schematron validation before raising prices**.

Without real schematron, VETO is a developer preview toy.  
With real schematron, VETO is a compliance infrastructure product.  
The price difference between those two: 2–5x.

Every other activity is secondary to: compile KoSIT artefacts → pass golden fixtures → ship.

---

## What kills this at €3K MRR (common failure modes)

1. Rule pack stays placeholder → customers churn when they need real compliance
2. No Stripe integration → can't charge anyone
3. No activation → free tier users never validate in production
4. Wrong ICP → targeting large enterprises who build their own

## What accelerates past €10K MRR

- XRechnung rules shipping before German B2B mandate 2025 deadline
- PEPPOL access points using VETO as their pre-validation layer
- One lighthouse customer with high invoice volume ($500K+ ARR potential)

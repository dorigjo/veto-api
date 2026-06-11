# VETO Pricing Strategy

## Pricing philosophy

VETO is priced on **compliance risk avoided**, not compute cost.

The cost of running one validation is <€0.001 in Cloudflare compute.  
The value of catching one rejection-causing error is €80–€600 in engineering time.  
The value gap justifies significant margin.

Do NOT price based on server costs. Price based on what the customer loses if they don't validate.

---

## Current pricing model (planned v0.4 enforcement)

| Plan | Validations/month | Price | Per-validation |
|------|-----------------|-------|----------------|
| Developer | 1,000 | Free | €0 |
| Starter | 50,000 | €29/month | €0.00058 |
| Growth | 500,000 | €149/month | €0.000298 |
| Scale | 5,000,000 | €599/month | €0.0001198 |
| Enterprise | Custom | Custom | Custom |

**Overage:** €0.50 per 1,000 validations beyond plan limit.

---

## Free tier logic

- 1,000 validations/month free, forever
- No credit card required for free tier
- Purpose: developer adoption, word-of-mouth, Show HN traction
- Conversion trigger: customer goes above 1K/month (indicates production use)
- Conversion rate target: 8–12% of active free tier users convert to paid

---

## Value-based pricing rationale

At Starter (50K/month, €29):
- Cost per validation: €0.00058
- A company processing 50K invoices/month avoiding even 1% rejection rate (500 rejections)
- Each rejection costs €200 in eng time: **€100,000 saved/month**
- VETO cost: **€29/month**
- ROI: **3,448x**

This means Starter is dramatically underpriced relative to value.

**Implication:** Price should increase significantly as we demonstrate real schematron validation.  
Target: €149/month Starter when full EN16931 schematron ships.

---

## When to raise prices

1. When EN16931 full schematron compiles and passes golden fixtures → +50% price increase
2. When XRechnung CIUS fully implemented → +25%
3. When SLA published with uptime guarantee → +30% for premium tier
4. When 100 paying customers → re-evaluate Starter at €49–€99

**Rule:** Never lower prices. Add a cheaper tier instead if needed.

---

## Pricing signals from the market

Use discovery calls to find:
- What do they currently spend on compliance engineering? (sets value ceiling)
- Have they evaluated other solutions? What did those cost?
- What's their invoice volume today and in 12 months?
- What's the cost of one invoice rejection at their company?

If the answer to "what's a rejection cost?" is >€500, they should be on Growth or Scale.

---

## Monthly minimums and annual plans

- Annual prepay: 20% discount (improves cash flow, reduces churn)
- Monthly minimum for Enterprise: €500/month (protects against low-volume enterprise accounts that cost more to support than they pay)

---

## Enterprise pricing

Enterprise (>€500/month) gets:
- SLA with uptime guarantee
- Dedicated support email (async, 24h response)
- Advance notice of rule pack updates
- Volume commit pricing
- Invoice (not just credit card)

No custom integrations. No on-premise deployment. No dedicated infrastructure.

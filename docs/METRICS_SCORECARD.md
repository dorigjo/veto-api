# VETO Metrics Scorecard

## North Star

**Validations prevented from rejection** — not validations run, not MRR.  
The business exists to prevent invoice rejection. Revenue is a proxy. Track the real thing.

---

## Revenue metrics

| Metric | Formula | Target (12 months) |
|--------|---------|-------------------|
| MRR | Sum of monthly subscription revenue | €10,000 |
| ARR | MRR × 12 | €120,000 |
| New MRR | MRR added from new customers | €2,000/month by M6 |
| Expansion MRR | MRR from plan upgrades | €500/month by M9 |
| Churned MRR | MRR lost to cancellation | <5% of MRR/month |
| Net Revenue Retention | (MRR + expansion - churn) / prior MRR | >100% |

---

## Activation metrics

| Metric | Definition | Target |
|--------|-----------|--------|
| Activation rate | % of signups who call /v1/validate within 7 days | >60% |
| Time to first validation | Minutes from signup to first 200 response | <15 min |
| Free→Paid conversion | % of free-tier users who convert to paid | 8–12% |
| Integration completion | % of signups who reach >100 validations/month | >40% |

---

## Validation volume metrics

| Metric | Definition | Target |
|--------|-----------|--------|
| Total validations/month | Across all customers | 500K by M12 |
| Validations per customer | Median monthly validations | >5,000 (signals production use) |
| INVALID rate | % of validations returning INVALID | 15–40% (healthy — users are finding real errors) |
| Error rule distribution | Which BR-xx rules trigger most | Track monthly — drives rule improvement priority |

---

## Business efficiency metrics

| Metric | Formula | Target |
|--------|---------|--------|
| CAC | Total sales+marketing spend / new customers | <€100 |
| LTV | Avg monthly revenue × avg customer lifetime | >€1,200 (avg 24-month lifetime) |
| LTV:CAC | LTV / CAC | >12:1 |
| CAC payback | CAC / (MRR per customer × gross margin) | <3 months |
| Gross margin | (MRR - COGS) / MRR | >90% |
| Founder hours/€1K MRR | Hours spent on ops per €1K MRR | <2 hours |

---

## Churn and retention

| Metric | Definition | Target |
|--------|-----------|--------|
| Logo churn | % of customers cancelling per month | <3% |
| Revenue churn (gross) | % of MRR cancelled per month | <3% |
| Net revenue churn | Revenue churn minus expansion | Negative (expansion > churn) |
| Reason for churn (tracked) | "Switched to competitor" / "stopped needing" / "compliance solved differently" | Track each |

---

## Invoice rejection prevented (north star)

This is estimated from:
- Validations returning INVALID × % that would have been submitted without VETO
- Estimated cost per rejection avoided (€200 default)

| Metric | Estimate |
|--------|---------|
| INVALID rate | 20% of validations |
| % that would have been submitted | 30% (assumption: customers have some existing checks) |
| Effective rejections prevented | 6% of total validations |
| At 500K validations/month | 30,000 rejections prevented/month |
| At €200/rejection | €6,000,000 of customer value/month |
| VETO revenue at that volume | ~€50,000/month |
| Value multiple | 120x |

---

## Reporting cadence

- Daily: validation volume (automated Cloudflare analytics)
- Weekly: MRR delta, new signups, activation rate
- Monthly: full scorecard review, LTV/CAC update, churn analysis
- Quarterly: pricing review, ICP validation, roadmap priority reset

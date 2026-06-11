# VETO Pain Calculator

The cost of not solving the invoice compliance problem.  
Use this in discovery calls and outbound messaging.

---

## 1. Invoice rejection cost

When a non-compliant invoice is rejected by a PEPPOL network or tax portal:

| Cost item | Estimate |
|-----------|----------|
| Manual intervention per rejection | 1–4 hours of engineering + ops time |
| Engineer hourly cost | €80–€150/hr |
| Per-rejection cost | €80–€600 |
| Invoices rejected per month (at 5% rejection rate, 100 invoices) | 5 |
| Monthly cost | €400–€3,000 |
| Annual cost | €4,800–€36,000 |

For a company processing 1,000 invoices/month at 5% rejection rate: **€48,000–€360,000/year** in manual correction labor.

---

## 2. Payment delay cost

When an invoice is rejected, payment is delayed until a corrected invoice is submitted and re-processed.

| Cost item | Estimate |
|-----------|----------|
| Average invoice value | €10,000 (B2B SME) |
| Average delay per rejection | 14–30 days |
| Cost of capital (10% annually) | ~0.03% per day |
| Cost per delayed €10K invoice (30 days) | ~€90 |
| 5 rejections/month | €450/month |
| Annual cash flow cost | €5,400 |

For high-volume processors: **€50,000–€500,000/year** in delayed cash flow.

---

## 3. ERP/billing engineering support cost

Companies without pre-submission validation spend engineering time debugging rejected submissions:

| Activity | Time estimate |
|----------|--------------|
| Debugging a rejection (no trace, no error codes) | 2–8 hours |
| Implementing manual inspection process | 1–2 days |
| Supporting customers affected by rejections | 4–16 hours/month |
| Annual engineering cost | €30,000–€80,000 |

---

## 4. Regulatory non-compliance risk

Germany (B2G): XRechnung is mandatory. Late submission or incorrect format can result in:
- Rejection of payment request
- Contract breach if invoice SLA not met
- Potential dispute with government customer

France (B2B mandate 2026): non-compliant invoices face:
- Rejection by Chorus Pro (government portal) or PDPs (registered service providers)
- Financial penalties being discussed in implementing legislation

**Risk value:** Highly variable. For companies with government contracts, a single contract loss due to compliance failure can be €100K–€5M.

---

## 5. Implementation delay cost

Building EN16931 validation from scratch instead of using VETO:

| Activity | Time estimate | Cost at €100/hr |
|----------|--------------|----------------|
| Reading EN16931 spec | 2 days | €1,600 |
| Implementing BR rules | 3–6 weeks | €12,000–€24,000 |
| Writing test fixtures | 1–2 weeks | €4,000–€8,000 |
| Debugging against KoSIT validator | 1–2 weeks | €4,000–€8,000 |
| Maintaining against spec updates | 5 days/year | €4,000/year |
| **Total first year** | | **€24,000–€48,000** |

VETO Starter plan: €29/month = **€348/year**.

ROI at Starter plan: **69x–138x** in year one.

---

## Messaging for outbound

```
Subject: XRechnung rejections costing you €400+ per incident?

Every time an XRechnung invoice is rejected, your team spends 2–4 hours debugging it blind.
That's €160–€600 per rejection in engineering time alone, before factoring in payment delays.

VETO catches these errors before submission. One API call, 50ms, €0.00058 per validation.

Works in 15 minutes. No dashboard. No vendor lock-in.
```

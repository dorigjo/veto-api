# VETO Sales Discovery Playbook

## Purpose

This is a script for 25–50 customer discovery conversations.  
Goal: understand the real pain, not sell the product.  
If 15+ of 50 conversations confirm the pain hypothesis, proceed to paid launch.

---

## Discovery hypothesis

> European SaaS companies building ERP, billing, or accounting software are losing significant time and money to invoice compliance failures, and would pay for an automated pre-submission validation API that eliminates that pain.

---

## Target audience for interviews

Prioritize (in order):
1. CTOs / lead engineers at ERP/accounting SaaS (5–50 employees, EU-focused)
2. Developers who recently implemented PEPPOL or XRechnung support
3. Developers who are about to implement it (active pain)
4. Finance/ops people dealing with invoice rejection consequences

Avoid: consultants, large enterprises, non-EU companies.

---

## Opening script

> "I'm building a developer tool for European invoice compliance and trying to understand the real problems people face. This is a research call, not a sales call — I'm not going to pitch you anything. Can I ask you about your experience with EN16931/PEPPOL/XRechnung invoice compliance?"

---

## Discovery questions

### Problem identification

1. "Have you had to implement EN16931 or PEPPOL invoice compliance? What did that look like?"
2. "What was the hardest part of the implementation?"
3. "How long did it take? How much did it cost in engineering time?"
4. "Did you get it right the first time? What happened when you got it wrong?"
5. "How do you validate invoices before submitting them? What does that process look like today?"

### Pain quantification

6. "Have you experienced invoice rejections in production? How often?"
7. "What happens when an invoice is rejected? Walk me through what you have to do."
8. "How much engineering time does a rejection typically cost you?"
9. "Has a rejection ever caused a payment to be delayed? By how much?"
10. "Have you lost a customer or deal because of compliance problems? What happened?"
11. "What would it cost your company if you completely stopped validating invoices before submission?"

### Current solution

12. "What tools or methods do you use today to validate invoice compliance?"
13. "What's broken or frustrating about your current approach?"
14. "Have you tried building your own validation? What stopped you or made it hard?"
15. "Have you evaluated any commercial validation tools? What did you find?"

### Willingness to pay

16. "If there was an API that checked invoices against EN16931/PEPPOL rules before you submit them — one API call, no vendor lock-in — what would that be worth to you per month?"
17. "At €29/month for 50,000 validations, would that be easy to justify? What would make it hard?"
18. "Who in your company would need to approve buying a tool like this?"
19. "What would you need to see before you trusted it in production?"

### Future / urgency

20. "Are there upcoming regulatory changes in your market affecting this? What's the timeline?"
21. "If this problem isn't solved in 6 months, what happens to you?"
22. "What would you do if VETO didn't exist?"

---

## Red flags in discovery (disqualifiers)

- "We don't really have invoice rejection problems" → no active pain
- "Our compliance team handles it" → wrong buyer
- "We're thinking about it for next year" → no urgency trigger
- "Can you do a custom integration with our ERP?" → wrong product fit

---

## Green flags (buy signals)

- "We just got a requirement from a customer that everything must be XRechnung"
- "We spent 3 weeks implementing this and it's still not right"
- "Every rejection costs us hours to debug"
- "We have a mandate going live in [month]"
- "We tried building it ourselves and gave up"

---

## Demo script (if they ask to see it)

```bash
# Show the API — no login, no dashboard, just works
curl -X POST https://api.veto.dev/v1/validate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: demo-key" \
  -d '{
    "invoice": {
      "invoice_number": "INV-001",
      "issue_date": "2024-11-15",
      "seller": { "country": "DE" },
      "buyer": { "country": "FR" },
      "currency": "EUR",
      "total_amount": 1190.00
    },
    "target_profile": "EN16931"
  }'
```

Point to: `decision`, `blocking_errors` + `remediation_hint`, `deterministic_trace`, `rule_pack_hash`.

Then show an invalid invoice and demonstrate how errors + hints tell the developer exactly what to fix.

---

## Close criteria

Do not launch paid tier until:
- 15/50 interviews confirm active invoice rejection pain
- 10/50 say "€29/month is a no-brainer"
- 5 people ask for early access before the call ends
- At least 3 say "I would have paid for this last quarter"

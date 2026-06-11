# VETO Ideal Customer Profile

## The exact first customer

**Company type:** 5–50 person B2B SaaS company selling ERP, accounting, billing, or procure-to-pay software to European SMEs or enterprises.

**Geography:** Germany, Austria, Netherlands, France, or Italy — markets with active EN16931 mandates or live PEPPOL adoption.

**Role of the buyer:** CTO, VP Engineering, or lead backend engineer. The person who has to implement the compliance requirement and is scared of getting it wrong.

**Situation:** They received a mandate from a customer, a sales requirement, or a regulatory deadline requiring EN16931/PEPPOL BIS/XRechnung-compliant invoice output. They have 4–12 weeks to ship it.

---

## The urgency trigger

The customer pays NOW when one of these happens:
1. A large B2G customer (e.g., German Bundesbehörde) tells them invoices must be XRechnung-format or they won't be paid
2. A new enterprise customer requires PEPPOL BIS invoice delivery as a contract condition
3. Their country announces a B2B e-invoicing mandate with a go-live date (Germany 2025, France 2024/2026, Belgium 2026)
4. An existing invoice submission was rejected by a tax portal and they need to understand why

Without a trigger, they'll push it to next quarter. With a trigger, they have a deadline.

---

## Buyer persona

```
Name: Marco / Stefan / Pieter (lead backend engineer)
Age: 28–42
Seniority: Mid to senior
Stack: TypeScript/Node.js, Java, or Python
Previous experience with e-invoicing: Near zero
Pain level: High — they've read the EN16931 spec and it's 80 pages of XML schemas
Time pressure: 4–8 weeks to ship compliance before a contract is lost
Support budget: None — they don't want to hire a consultant
Preferred solution: API, no vendor lock-in, pay-as-you-go
Google search: "peppol bis validation api", "xrechnung validation nodejs", "en16931 check typescript"
```

---

## Why they pay for VETO instead of building it themselves

1. **Time:** Implementing EN16931 rules from scratch takes 2–6 weeks of engineering time. VETO is an afternoon integration.
2. **Risk:** Incorrect validation means rejected invoices, payment delays, tax non-compliance. The cost of a mistake exceeds the cost of the API.
3. **Maintenance:** The standards body (OpenPEPPOL, KoSIT) releases updates. VETO absorbs those updates; the customer doesn't.
4. **Auditability:** `deterministic_trace` + `rule_pack_hash` gives them an audit trail without building one.

---

## Excluded customers

Do NOT target:
- Large enterprises with in-house compliance teams (they build their own)
- Consultancies (wrong business model — they want to bill hours, not buy APIs)
- Non-technical buyers (no integration path without a developer)
- Companies in non-EN16931 markets (US, UK post-Brexit, APAC) — no regulatory urgency
- Companies that want a full PEPPOL Access Point (VETO is not one)

---

## The qualification test

Ask in discovery: "What happens to your company if invoices aren't compliant by [date]?"

If the answer is "nothing serious," they are not a customer yet.  
If the answer is "we lose the customer/contract/payment," they are.

# Pricing

VETO uses usage-based pricing. You pay per validation request, not per seat.

---

## Tiers (Planned)

| Tier | Requests/month | Price | Target |
|---|---|---|---|
| **Hobby** | 1,000 | Free | Developers testing integration |
| **Starter** | 50,000 | €29/month | Small ERPs, freelancers |
| **Growth** | 500,000 | €149/month | Mid-market software vendors |
| **Scale** | 5,000,000 | €599/month | Large ISVs, accounting platforms |
| **Enterprise** | Unlimited | Custom | Contract negotiation |

Overage: €0.50 per 1,000 requests above plan limit.

---

## What You Pay For

You pay for validated requests only. The following are always free:
- `GET /v1/health`
- `GET /v1/version`
- Requests that return `400` (schema error before validation runs)
- Requests that return `401` (authentication failed)

---

## Why Usage-Based

E-invoicing volumes vary enormously — a freelancer sends 20 invoices/month; a mid-market ERP processes 200,000. A flat monthly seat fee would price out the long tail and undercharge the heavy users. Usage-based pricing aligns cost with value.

---

## Cost Drivers

VETO runs on Cloudflare Workers at approximately:
- €0.00000015 per Worker invocation (Cloudflare pricing)
- Zero database cost (stateless)
- Zero storage cost (no data retained)

Gross margins on the Starter tier are 99%+. This cost structure is the core business advantage.

---

## MVP Launch Approach

At MVP launch, pricing is not enforced in the API. API keys are issued manually via email. Stripe integration and automated key provisioning are v0.4 scope.

For the first 10 customers: free access in exchange for feedback.

---

## Annual Discounts

Annual billing receives 2 months free (equivalent to 17% discount). Applied manually in MVP; automated at v0.4.

---

## Fair Use

Intentional abuse (automated fuzzing, denial-of-service) will result in key revocation. Rate limiting will be enforced starting v0.4.

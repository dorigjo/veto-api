# Go-to-Market Strategy

## Positioning

**VETO is the validation layer for European e-invoicing software.**

Not an ERP. Not a PEPPOL Access Point. Not a compliance consultant. The single, narrow thing that software developers need when building EN 16931 or PEPPOL-compliant invoice flows — and want to outsource.

---

## Ideal Customer Profile (ICP)

### Primary: ERP / Accounting Software Developers

- Building SaaS ERPs, accounting tools, or billing platforms for the European market
- Need to claim EN 16931 or PEPPOL compliance without owning the rule set
- Would rather integrate an API than maintain 200+ XML business rules themselves
- Decision-maker: CTO or lead developer at a company with 2–50 engineers

### Secondary: Corporate IT / Finance Teams

- Large companies with custom invoice systems that need to validate outbound invoices before submission
- Usually Germany, Austria, France, Italy, or Netherlands (mandated e-invoicing markets)

### Anti-ICP (do not target)

- Companies that want a full Access Point (routing + delivery) — refer to Peppol-certified providers
- Companies that want ERP functionality or consulting — not our business

---

## Channels

### 1. Developer Communities (Zero CAC)

- GitHub — open-source rule pack, issues as community touchpoints
- Hacker News (Show HN) at launch
- Dev.to and Medium technical posts: "How I built an EN 16931 validator on Cloudflare Workers"
- Twitter/X — e-invoicing mandate coverage is a recurring news topic (Germany 2025, France 2026, etc.)

### 2. SEO / Content (Slow Burn)

Target queries:
- "EN 16931 validation API"
- "PEPPOL BIS invoice validation"
- "XRechnung validate API"
- "e-invoicing compliance API Germany"

One article per week during v0.1–v0.3. No AI-generated content — real technical depth wins.

### 3. Direct Outreach (First 10 Customers)

- Cold email CTOs of European SaaS accounting tools found on Product Hunt, AppSumo, LinkedIn
- Frame as: "Will your product need EN 16931 compliance? I built the validation infrastructure."
- Offer free beta access

### 4. Partner / Reseller (v0.4+)

- PEPPOL Access Point providers who need a validation layer they can embed
- German tax software ecosystem (DATEV ecosystem vendors)

---

## Launch Sequence

1. **Now (v0.1)** — Deploy Worker, get a working endpoint, start dogfooding
2. **Week 2** — Write Show HN post, publish on GitHub
3. **Week 4** — First 3 beta customers via direct outreach
4. **Month 2** — v0.2 ships (real EN 16931 rules), first paid customer
5. **Month 4** — v0.3 ships (PEPPOL rules), Stripe integration
6. **Month 6** — Public launch, pricing page live

---

## Revenue Target

- 10 paying customers at €29/month = €290 MRR (covers Cloudflare costs ~100x)
- 50 customers at blended €80/month = €4,000 MRR (viable solo business)
- 200 customers at blended €100/month = €20,000 MRR (hire first employee)

First milestone: €290 MRR. Everything else is scaling.

---

## Competitive Differentiation

| Feature | VETO | Build-in-house | Large compliance vendor |
|---|---|---|---|
| Time to first validation | Minutes | Weeks/months | Weeks (sales cycle) |
| Rule pack maintenance | Included | Your problem | Included |
| Pricing | Per request | Engineering cost | Enterprise contract |
| Stateless / no-storage | Yes | Depends | No |
| Open rule pack | Yes | N/A | Usually not |

---

## Constraints and Focus

Solo founder. Abitur-priority. Max 5 hours/week post-launch.

Every GTM action must be either: (a) free, (b) asynchronous, or (c) automated. No sales calls in the MVP phase. No trade shows. No account management.

The product sells itself if the documentation is excellent and the first experience is frictionless.

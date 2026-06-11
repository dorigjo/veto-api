# VETO Outbound Playbook

## First 100 prospects

Target list construction:

**Segment 1: DE/AT ERP and accounting SaaS (40 companies)**
- Search GitHub for repos containing "xrechnung" OR "zugferd" OR "peppol" with TypeScript/Java/Python
- Search ProductHunt for "invoice" + "Europe" products launched in last 2 years
- Search AngelList/Crunchbase for "accounting software" + Germany/Austria/Netherlands seed-stage

**Segment 2: PEPPOL ecosystem participants (30 companies)**
- OpenPEPPOL participant directory: https://www.peppol.eu/about-openpeppol/members/
- Access points looking to add pre-submission validation

**Segment 3: ERP integrators (30 companies)**
- SAP, Dynamics, Odoo implementation partners in DE/NL/FR

---

## Qualification criteria

Before reaching out, verify:
- Company is in EU (or building for EU market)
- Has a technical team (CTO/engineers on LinkedIn/GitHub)
- Shows evidence of invoice/billing/ERP product
- Has at least 5 employees (signals real budget)

---

## Outbound email template (cold)

**Subject:** XRechnung / PEPPOL invoice rejections — pre-submission check?

```
Hi [First name],

I'm building VETO — a stateless API for pre-submission e-invoice validation.
No dashboard. No storage. One POST, 50ms, deterministic EN16931/PEPPOL/XRechnung results.

Saw [Company] is in the [ERP/billing/accounting] space.
Compliance-related invoice rejections typically cost €200–€600 per incident in eng time alone.

If it's relevant: https://github.com/dorigjo/veto-api — the API is open, free tier available.

Are you currently doing pre-submission validation before sending invoices to PEPPOL / Chorus Pro / tax portals?

[Your name]
```

Keep it under 100 words. One question at the end. No feature list.

---

## LinkedIn DM template

```
Hi [Name] — working on e-invoice validation APIs (EN16931/PEPPOL/XRechnung). 
Building for the pre-submission gap before invoices hit the PEPPOL network.
Are invoice rejection rates something your team deals with at [Company]?
```

---

## "Invoice rejection / payment delay" pain messaging

Use these angles depending on context:

**Engineering pain:** "You've read the EN16931 spec. It's 80 pages. Building your own validator takes 4–6 weeks and needs maintenance every time OpenPEPPOL releases a new schematron version."

**Ops pain:** "Every rejected invoice is a manual correction loop. Invoice out → rejection notice → engineer debugs → corrected invoice → resubmit → 14 more days until payment."

**Financial pain:** "A 2% invoice rejection rate on €5M/year in invoiced revenue = €100K in delayed payments. The cost of capital on that is real."

**Deadline pain:** "Germany's B2G mandate is live. France's B2B mandate is 2026. Your customers will ask about this before you're ready."

---

## Follow-up sequence

1. Initial email (day 0)
2. Follow-up if no reply: "Just checking — is invoice compliance on your roadmap this quarter?" (day 5)
3. If still no reply: share a specific relevant article or EN16931 update (day 14)
4. Final: "I'm building the first 10 customer case studies — would you have 20 minutes to share how you're handling this today?" (day 21)

If no response after day 21: move on. Don't spam.

---

## Channel prioritization

1. Cold email (highest signal-to-noise for technical founders)
2. LinkedIn DM (good for warm intros)
3. GitHub issues on relevant repos (ultra-targeted)
4. Show HN / r/webdev (free, large reach, developer-focused)
5. Content/SEO: "en16931 validation api", "peppol bis typescript" (compound interest)

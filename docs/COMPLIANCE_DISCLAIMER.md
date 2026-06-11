# VETO Compliance Disclaimer

**Read this before using VETO in any production invoicing workflow.**

---

## Current status: Developer preview

VETO is currently a **developer preview**. It is suitable for:
- Integration testing your invoice payload schema
- Early detection of obviously malformed invoices
- Understanding the shape of EN16931/PEPPOL/XRechnung validation responses
- Building the validation integration in your ERP or billing system

VETO is **not yet suitable** for:
- Final pre-submission compliance gating for live invoices
- Replacing official validator tools in production
- Certifying that an invoice will be accepted by a tax authority
- Certifying PEPPOL access point compliance

---

## What VETO does NOT validate today

VETO v0.2.0 evaluates 7 hand-coded rules covering:
- Invoice number presence
- Issue date presence
- Seller/buyer country presence
- Total amount presence
- Currency format (3-letter uppercase)
- Non-negative total (warning)

**EN16931 has 128+ mandatory rules.** The current rules cover approximately 5%.

**Not validated today (incomplete list):**
- VAT category codes and rates
- Tax calculation consistency (BR-CO-14 to BR-CO-25)
- Payment means codes
- Unit codes (UNCL6411)
- Allowance/charge reason codes
- Document type codes (UNCL1001)
- Buyer/seller tax identifier formats
- Country-specific tax registration formats
- PEPPOL network identifiers (GLN, OIN)
- XRechnung mandatory buyer reference (Leitweg-ID)
- XRechnung payment account identifier rules
- UBL 2.1 structural constraints
- CII D16B structural constraints

---

## Official validators you should also use

Until VETO implements full schematron validation, use these alongside VETO:

| Standard | Official Validator | Source |
|----------|-------------------|--------|
| EN16931 + PEPPOL | PEPPOL Schematron | https://github.com/OpenPEPPOL/peppol-bis-invoice-3 |
| XRechnung | KoSIT Validator | https://github.com/itplr-kosit/validator/releases |
| General | Mustang Project | https://github.com/ZUGFeRD/mustangproject |

---

## How to detect placeholder rule packs

Every VETO response includes:
```json
{
  "rule_pack_hash": "sha256-PLACEHOLDER-2024.1-7rules"
}
```

The string `PLACEHOLDER` in `rule_pack_hash` is an intentional machine-readable signal that the rule pack has not been compiled from official schematron artefacts. When real artefacts are compiled, this will be a real SHA256 hash without `PLACEHOLDER`.

Your integration should check for `PLACEHOLDER` and warn users accordingly.

---

## Legal notice

VETO provides a technical pre-flight check, not a legal compliance certification. Tax authority acceptance depends on factors beyond schema validation, including registration status, tax identification, and jurisdiction-specific rules. Consult a qualified tax advisor for legal compliance.

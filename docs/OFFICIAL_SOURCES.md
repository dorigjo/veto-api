# Official Artefact Sources

This document lists the authoritative sources for each supported e-invoicing standard.  
**Only these sources are acceptable inputs for rule pack compilation.**

Do not use blog posts, third-party summaries, LLM outputs, or unofficial implementations.

---

## EN16931 — European Semantic Data Model

**Authority:** CEN/TC 434 (European Committee for Standardization)  
**Standard:** EN 16931-1:2017 + Amendment A1:2019  
**Syntax bindings:** CEN/TS 16931-3 (UBL 2.1 and UN/CEFACT CII D16B)

| Artefact | Location |
|----------|----------|
| Schematron (UBL) | https://github.com/ConnectingEurope/eInvoicing-EN16931/releases |
| Schematron (CII) | https://github.com/ConnectingEurope/eInvoicing-EN16931/releases |
| Business rules spec | https://www.cen.eu/work/areas/ICT/eBusiness/Pages/prEN16931-1.aspx |
| Code lists | https://github.com/ConnectingEurope/eInvoicing-EN16931/tree/master/code-list |

**Pinned release:** Use the latest stable tag on the GitHub repository.  
**Hash verification:** Compare SHA256 of downloaded .sch file against the release notes.

---

## PEPPOL BIS Billing 3.0 — OpenPEPPOL CIUS

**Authority:** OpenPEPPOL (Association for Electronic Business Documents)  
**Standard:** PEPPOL BIS Billing 3.0 (CIUS on EN16931)  
**Specification:** https://docs.peppol.eu/poacc/billing/3.0/

| Artefact | Location |
|----------|----------|
| Schematron (UBL) | https://github.com/OpenPEPPOL/peppol-bis-invoice-3/releases |
| Schematron (CII) | https://github.com/OpenPEPPOL/peppol-bis-invoice-3/releases |
| Validation guide | https://docs.peppol.eu/poacc/billing/3.0/bis/ |
| Code lists | https://docs.peppol.eu/poacc/billing/3.0/codelist/ |

**Note:** PEPPOL BIS is a CIUS (Core Invoice Usage Specification) — it extends EN16931, not replaces it. Both EN16931 schematron AND PEPPOL schematron must pass for a valid PEPPOL invoice.

---

## XRechnung 3.0 — KoSIT German CIUS

**Authority:** KoSIT (Koordinierungsstelle für IT-Standards), on behalf of the German government  
**Standard:** XRechnung 3.0 (CIUS on EN16931, mandatory for B2G in Germany)  
**Specification:** https://xeinkauf.de/xrechnung/

| Artefact | Location |
|----------|----------|
| Validator configuration | https://github.com/itplr-kosit/validator-configuration-xrechnung/releases |
| Schematron rules | Bundled in validator configuration release |
| Test suite | https://github.com/itplr-kosit/xrechnung-testsuite |
| Documentation | https://xeinkauf.de/xrechnung/versionen-und-bundles/ |

**Note:** KoSIT provides a standalone validator (Java) that can be used to independently verify VETO's results during development.  
**Download:** https://github.com/itplr-kosit/validator/releases

---

## UBL 2.1 — OASIS

**Authority:** OASIS  
**Schema:** https://docs.oasis-open.org/ubl/os-UBL-2.1/  
**XSD:** https://docs.oasis-open.org/ubl/os-UBL-2.1/xsdrt/

---

## UN/CEFACT CII D16B

**Authority:** UN/CEFACT  
**Schema:** https://www.unece.org/cefact/xml_schemas/index  
**Used by:** EN16931 CII syntax binding, XRechnung CII profile

---

## Code lists

| Code list | Authority | URL |
|-----------|-----------|-----|
| ISO 4217 Currency codes | ISO | https://www.iso.org/iso-4217-currency-codes.html |
| ISO 3166-1 Country codes | ISO | https://www.iso.org/iso-3166-country-codes.html |
| ISO 6523 ICD codes | ISO | https://www.iso.org/standard/25773.html |
| UNCL1001 Document types | UN/CEFACT | https://tfig.unece.org/contents/recommendation-20.htm |
| UNCL5305 Tax category | UN/CEFACT | https://tfig.unece.org/contents/recommendation-20.htm |
| UNTDID 4461 Payment means | UN/EDIFACT | https://www.unece.org/trade/untdid/ |

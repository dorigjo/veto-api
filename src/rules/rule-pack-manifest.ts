export type RulePackSyntax = 'UBL-2.1' | 'CII-16B' | 'XRECHNUNG-UBL' | 'XRECHNUNG-CII';
export type RulePackRuntime = 'cloudflare-workers' | 'node' | 'deno';

export interface RulePackManifest {
  rule_pack_id: string;
  standard: string;
  profile: string;
  syntax: RulePackSyntax;
  source: string;
  source_url: string;
  version: string;
  generated_at: string;
  artifact_hash: string;
  rules_count: number;
  supported_runtime: RulePackRuntime;
  is_placeholder: boolean;
  is_cius: boolean;
  base_standard: string;
}

// EN16931 — CEN/TC 434 semantic data model
// Official schematron: https://github.com/ConnectingEurope/eInvoicing-EN16931
// Status: PLACEHOLDER — rules are hand-coded approximations, not official schematron
export const EN16931_MANIFEST: RulePackManifest = {
  rule_pack_id: 'en16931-2024.1',
  standard: 'EN16931',
  profile: 'EN16931',
  syntax: 'UBL-2.1',
  source: 'CEN/TC 434 EN 16931-1:2017',
  source_url: 'https://github.com/ConnectingEurope/eInvoicing-EN16931',
  version: '2024.1',
  generated_at: '2024-11-01T00:00:00Z',
  artifact_hash: 'sha256-PLACEHOLDER-en16931-2024.1',
  rules_count: 7,
  supported_runtime: 'cloudflare-workers',
  is_placeholder: true,
  is_cius: false,
  base_standard: 'EN16931',
};

// PEPPOL BIS Billing 3.0 — OpenPEPPOL CIUS on EN16931
// Official schematron: https://github.com/OpenPEPPOL/peppol-bis-invoice-3
// Status: PLACEHOLDER — applies EN16931 base rules only; PEPPOL-specific rules pending
export const PEPPOL_BIS_3_MANIFEST: RulePackManifest = {
  rule_pack_id: 'peppol-bis-3.0-2024.1',
  standard: 'PEPPOL-BIS',
  profile: 'PEPPOL-BIS-3.0',
  syntax: 'UBL-2.1',
  source: 'OpenPEPPOL PEPPOL BIS Billing 3.0',
  source_url: 'https://github.com/OpenPEPPOL/peppol-bis-invoice-3',
  version: '2024.1',
  generated_at: '2024-11-01T00:00:00Z',
  artifact_hash: 'sha256-PLACEHOLDER-peppol-bis-3.0-2024.1',
  rules_count: 7,
  supported_runtime: 'cloudflare-workers',
  is_placeholder: true,
  is_cius: true,
  base_standard: 'EN16931',
};

// XRechnung 3.0 — KoSIT German CIUS on EN16931
// Official schematron: https://github.com/itplr-kosit/validator-configuration-xrechnung
// Status: PLACEHOLDER — applies EN16931 base rules only; XRechnung-specific CIUS rules pending
export const XRECHNUNG_3_MANIFEST: RulePackManifest = {
  rule_pack_id: 'xrechnung-3.0-2024.1',
  standard: 'XRECHNUNG',
  profile: 'XRECHNUNG-3.0',
  syntax: 'UBL-2.1',
  source: 'KoSIT XRechnung 3.0 CIUS',
  source_url: 'https://github.com/itplr-kosit/validator-configuration-xrechnung',
  version: '3.0',
  generated_at: '2024-11-01T00:00:00Z',
  artifact_hash: 'sha256-PLACEHOLDER-xrechnung-3.0-2024.1',
  rules_count: 7,
  supported_runtime: 'cloudflare-workers',
  is_placeholder: true,
  is_cius: true,
  base_standard: 'EN16931',
};

export const RULE_PACK_REGISTRY: Record<string, RulePackManifest> = {
  EN16931: EN16931_MANIFEST,
  'PEPPOL-BIS-3.0': PEPPOL_BIS_3_MANIFEST,
  'XRECHNUNG-3.0': XRECHNUNG_3_MANIFEST,
};

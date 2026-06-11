export type AppEnv = {
  Bindings: {
    VALID_API_KEYS: string;
  };
};

export interface InvoicePayload {
  invoice_number?: string;
  issue_date?: string;
  seller?: {
    name?: string;
    country?: string;
  };
  buyer?: {
    name?: string;
    country?: string;
  };
  currency?: string;
  total_amount?: number;
  [key: string]: unknown;
}

export interface ValidateRequest {
  invoice: InvoicePayload;
  target_profile: string;
  options?: {
    strict?: boolean;
  };
}

export type RemediationHintType =
  | 'missing_field'
  | 'invalid_code'
  | 'unsupported_profile'
  | 'transformable_gap'
  | 'authority_profile_mismatch';

export interface RemediationHint {
  hint_type: RemediationHintType;
  description: string;
}

export interface RuleViolation {
  rule_id: string;
  message: string;
  severity: 'error' | 'warning';
  remediation_hint?: RemediationHint;
}

export interface TraceEntry {
  rule_id: string;
  passed: boolean;
  severity: 'error' | 'warning';
  description: string;
}

export type Decision = 'VALID' | 'INVALID' | 'WARNING';

export interface ProfileResolution {
  requested: string;
  resolved: string;
  rule_pack_id: string;
  rule_pack_hash: string;
  is_cius: boolean;
  base_standard: string;
}

export interface ValidationResponse {
  request_id: string;
  decision: Decision;
  deterministic_trace: boolean;
  engine_version: string;
  rule_pack_version: string;
  rule_pack_hash: string;
  target_profile: string;
  profile_resolution: ProfileResolution;
  blocking_errors: RuleViolation[];
  warnings: RuleViolation[];
  trace: TraceEntry[];
  storage_statement: string;
}

export interface HealthResponse {
  status: 'ok';
  timestamp: string;
}

export interface VersionResponse {
  engine_version: string;
  rule_pack_version: string;
  supported_profiles: string[];
}

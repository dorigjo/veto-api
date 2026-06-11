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

export interface RuleViolation {
  rule_id: string;
  message: string;
}

export interface TraceEntry {
  rule_id: string;
  passed: boolean;
  severity: 'error' | 'warning';
  description: string;
}

export type Decision = 'VALID' | 'INVALID' | 'WARNING';

export interface ValidationResponse {
  request_id: string;
  decision: Decision;
  engine_version: string;
  rule_pack_version: string;
  target_profile: string;
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

import type { InvoicePayload, RuleViolation, TraceEntry, RemediationHint } from '../types/index.js';

export interface Rule {
  id: string;
  description: string;
  severity: 'error' | 'warning';
  check: (invoice: InvoicePayload) => boolean;
  message: string;
  remediation_hint: RemediationHint;
}

export const RULES: Rule[] = [
  {
    id: 'BR-01',
    description: 'Invoice must contain an invoice number',
    severity: 'error',
    check: (inv) => typeof inv.invoice_number === 'string' && inv.invoice_number.trim().length > 0,
    message: 'Missing or empty invoice number (invoice_number)',
    remediation_hint: {
      hint_type: 'missing_field',
      description: 'Add field invoice_number with a non-empty string value, e.g. "INV-2024-0001"',
    },
  },
  {
    id: 'BR-02',
    description: 'Invoice must contain an issue date',
    severity: 'error',
    check: (inv) => typeof inv.issue_date === 'string' && inv.issue_date.trim().length > 0,
    message: 'Missing or empty issue date (issue_date)',
    remediation_hint: {
      hint_type: 'missing_field',
      description: 'Add field issue_date with ISO 8601 date string, e.g. "2024-11-15"',
    },
  },
  {
    id: 'BR-04',
    description: 'Seller country must be present',
    severity: 'error',
    check: (inv) => typeof inv.seller?.country === 'string' && inv.seller.country.trim().length > 0,
    message: 'Missing seller country (seller.country)',
    remediation_hint: {
      hint_type: 'missing_field',
      description: 'Add field seller.country with ISO 3166-1 alpha-2 code, e.g. "DE"',
    },
  },
  {
    id: 'BR-07',
    description: 'Buyer country must be present',
    severity: 'error',
    check: (inv) => typeof inv.buyer?.country === 'string' && inv.buyer.country.trim().length > 0,
    message: 'Missing buyer country (buyer.country)',
    remediation_hint: {
      hint_type: 'missing_field',
      description: 'Add field buyer.country with ISO 3166-1 alpha-2 code, e.g. "FR"',
    },
  },
  {
    id: 'BR-09',
    description: 'Invoice must contain a total payable amount',
    severity: 'error',
    check: (inv) => typeof inv.total_amount === 'number' && isFinite(inv.total_amount),
    message: 'Missing or non-numeric total amount (total_amount)',
    remediation_hint: {
      hint_type: 'missing_field',
      description: 'Add field total_amount as a finite numeric value, e.g. 1190.00',
    },
  },
  {
    id: 'BR-CL-04',
    description: 'Invoiced currency must be a valid ISO 4217 three-letter code',
    severity: 'error',
    check: (inv) => {
      if (inv.currency === undefined || inv.currency === null) return true;
      return typeof inv.currency === 'string' && /^[A-Z]{3}$/.test(inv.currency);
    },
    message: 'Invalid currency format — must be ISO 4217 three-letter code, e.g. EUR (currency)',
    remediation_hint: {
      hint_type: 'invalid_code',
      description: 'Use ISO 4217 three-letter uppercase code, e.g. "EUR", "USD", "GBP"',
    },
  },
  {
    id: 'BR-DEC-01',
    description: 'Total amount must not be negative',
    severity: 'warning',
    check: (inv) => {
      if (typeof inv.total_amount !== 'number') return true;
      return inv.total_amount >= 0;
    },
    message: 'Total amount is negative — verify this is intentional (total_amount)',
    remediation_hint: {
      hint_type: 'transformable_gap',
      description: 'Negative amounts may be valid for credit notes; confirm intent and document accordingly',
    },
  },
];

export interface EngineRuleResult {
  violations: RuleViolation[];
  warnings: RuleViolation[];
  trace: TraceEntry[];
}

export function evaluateRules(invoice: InvoicePayload): EngineRuleResult {
  const violations: RuleViolation[] = [];
  const warnings: RuleViolation[] = [];
  const trace: TraceEntry[] = [];

  for (const rule of RULES) {
    const passed = rule.check(invoice);
    trace.push({ rule_id: rule.id, passed, severity: rule.severity, description: rule.description });
    if (!passed) {
      if (rule.severity === 'error') {
        violations.push({
          rule_id: rule.id,
          message: rule.message,
          severity: 'error',
          remediation_hint: rule.remediation_hint,
        });
      } else {
        warnings.push({
          rule_id: rule.id,
          message: rule.message,
          severity: 'warning',
          remediation_hint: rule.remediation_hint,
        });
      }
    }
  }

  return { violations, warnings, trace };
}

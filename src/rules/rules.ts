import type { InvoicePayload, RuleViolation, TraceEntry } from '../types/index.js';

export interface Rule {
  id: string;
  description: string;
  severity: 'error' | 'warning';
  check: (invoice: InvoicePayload) => boolean;
  message: string;
}

export const RULES: Rule[] = [
  {
    id: 'BR-01',
    description: 'Invoice must contain an invoice number',
    severity: 'error',
    check: (inv) => typeof inv.invoice_number === 'string' && inv.invoice_number.trim().length > 0,
    message: 'Missing or empty invoice number (invoice_number)',
  },
  {
    id: 'BR-02',
    description: 'Invoice must contain an issue date',
    severity: 'error',
    check: (inv) => typeof inv.issue_date === 'string' && inv.issue_date.trim().length > 0,
    message: 'Missing or empty issue date (issue_date)',
  },
  {
    id: 'BR-04',
    description: 'Seller country must be present',
    severity: 'error',
    check: (inv) => typeof inv.seller?.country === 'string' && inv.seller.country.trim().length > 0,
    message: 'Missing seller country (seller.country)',
  },
  {
    id: 'BR-07',
    description: 'Buyer country must be present',
    severity: 'error',
    check: (inv) => typeof inv.buyer?.country === 'string' && inv.buyer.country.trim().length > 0,
    message: 'Missing buyer country (buyer.country)',
  },
  {
    id: 'BR-09',
    description: 'Invoice must contain a total payable amount',
    severity: 'error',
    check: (inv) => typeof inv.total_amount === 'number' && isFinite(inv.total_amount),
    message: 'Missing or non-numeric total amount (total_amount)',
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
        violations.push({ rule_id: rule.id, message: rule.message });
      } else {
        warnings.push({ rule_id: rule.id, message: rule.message });
      }
    }
  }

  return { violations, warnings, trace };
}

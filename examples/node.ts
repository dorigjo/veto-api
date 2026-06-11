/**
 * VETO API — TypeScript integration example
 * Run: npx tsx examples/node.ts
 */

const BASE_URL = process.env.VETO_BASE_URL ?? 'https://api.veto.dev';
const API_KEY = process.env.VETO_API_KEY ?? 'dev-key-change-in-production';

interface InvoicePayload {
  invoice_number?: string;
  issue_date?: string;
  seller?: { name?: string; country?: string };
  buyer?: { name?: string; country?: string };
  currency?: string;
  total_amount?: number;
}

interface RuleViolation {
  rule_id: string;
  message: string;
}

interface TraceEntry {
  rule_id: string;
  passed: boolean;
  severity: 'error' | 'warning';
  description: string;
}

interface ValidationResponse {
  request_id: string;
  decision: 'VALID' | 'INVALID' | 'WARNING';
  engine_version: string;
  rule_pack_version: string;
  target_profile: string;
  blocking_errors: RuleViolation[];
  warnings: RuleViolation[];
  trace: TraceEntry[];
  storage_statement: string;
}

async function validate(invoice: InvoicePayload, targetProfile: string): Promise<ValidationResponse> {
  const response = await fetch(`${BASE_URL}/v1/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({ invoice, target_profile: targetProfile }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`VETO API error ${response.status}: ${JSON.stringify(error)}`);
  }

  return response.json() as Promise<ValidationResponse>;
}

async function main() {
  console.log('VETO API — TypeScript Example\n');

  // 1. Health check
  const health = await fetch(`${BASE_URL}/v1/health`).then((r) => r.json());
  console.log('Health:', health);

  // 2. Version
  const version = await fetch(`${BASE_URL}/v1/version`).then((r) => r.json());
  console.log('Version:', version);

  // 3. Valid invoice
  console.log('\n--- Valid Invoice ---');
  const validResult = await validate(
    {
      invoice_number: 'INV-2024-0001',
      issue_date: '2024-11-15',
      seller: { name: 'Acme GmbH', country: 'DE' },
      buyer: { name: 'Beta Corp S.A.', country: 'FR' },
      currency: 'EUR',
      total_amount: 1190.0,
    },
    'EN16931',
  );
  console.log('Decision:', validResult.decision);
  console.log('Request ID:', validResult.request_id);
  console.log('Errors:', validResult.blocking_errors.length);
  console.log('Storage statement:', validResult.storage_statement);

  // 4. Invalid invoice
  console.log('\n--- Invalid Invoice ---');
  const invalidResult = await validate({ currency: 'EUROS' }, 'EN16931');
  console.log('Decision:', invalidResult.decision);
  console.log('Errors:');
  for (const err of invalidResult.blocking_errors) {
    console.log(`  [${err.rule_id}] ${err.message}`);
  }

  // 5. PEPPOL profile
  console.log('\n--- PEPPOL BIS 3.0 ---');
  const peppolResult = await validate(
    {
      invoice_number: 'PEPPOL-001',
      issue_date: '2024-11-15',
      seller: { country: 'NL' },
      buyer: { country: 'NO' },
      currency: 'EUR',
      total_amount: 250.0,
    },
    'PEPPOL-BIS-3.0',
  );
  console.log('Decision:', peppolResult.decision);
  console.log('Profile:', peppolResult.target_profile);
}

main().catch(console.error);

import type { InvoicePayload, ValidationResponse, Decision } from '../types/index.js';
import { ENGINE_VERSION, RULE_PACK_VERSION, STORAGE_STATEMENT } from '../lib/version.js';
import { generateRequestId } from '../lib/request-id.js';
import { isSupportedProfile } from './profiles.js';
import { evaluateRules } from './rules.js';

export function runEngine(invoice: InvoicePayload, targetProfile: string): ValidationResponse {
  const requestId = generateRequestId();

  if (!isSupportedProfile(targetProfile)) {
    return {
      request_id: requestId,
      decision: 'INVALID',
      engine_version: ENGINE_VERSION,
      rule_pack_version: RULE_PACK_VERSION,
      target_profile: targetProfile,
      blocking_errors: [
        {
          rule_id: 'VT-01',
          message: `Unsupported target profile "${targetProfile}". Supported: EN16931, PEPPOL-BIS-3.0`,
        },
      ],
      warnings: [],
      trace: [
        {
          rule_id: 'VT-01',
          passed: false,
          severity: 'error',
          description: 'Target profile must be a supported profile identifier',
        },
      ],
      storage_statement: STORAGE_STATEMENT,
    };
  }

  const { violations, warnings, trace } = evaluateRules(invoice);

  let decision: Decision;
  if (violations.length > 0) {
    decision = 'INVALID';
  } else if (warnings.length > 0) {
    decision = 'WARNING';
  } else {
    decision = 'VALID';
  }

  return {
    request_id: requestId,
    decision,
    engine_version: ENGINE_VERSION,
    rule_pack_version: RULE_PACK_VERSION,
    target_profile: targetProfile,
    blocking_errors: violations,
    warnings,
    trace,
    storage_statement: STORAGE_STATEMENT,
  };
}

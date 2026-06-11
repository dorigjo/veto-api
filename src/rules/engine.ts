import type { InvoicePayload, ValidationResponse, Decision } from '../types/index.js';
import { ENGINE_VERSION, RULE_PACK_VERSION, RULE_PACK_HASH, STORAGE_STATEMENT } from '../lib/version.js';
import { generateRequestId } from '../lib/request-id.js';
import { isSupportedProfile } from './profiles.js';
import { selectRulePack } from './profile-selector.js';
import { evaluateRules } from './rules.js';

export function runEngine(invoice: InvoicePayload, targetProfile: string): ValidationResponse {
  const requestId = generateRequestId();
  const profileResolution = selectRulePack(targetProfile);

  if (!isSupportedProfile(targetProfile)) {
    return {
      request_id: requestId,
      decision: 'INVALID',
      deterministic_trace: true,
      engine_version: ENGINE_VERSION,
      rule_pack_version: RULE_PACK_VERSION,
      rule_pack_hash: RULE_PACK_HASH,
      target_profile: targetProfile,
      profile_resolution: profileResolution,
      blocking_errors: [
        {
          rule_id: 'VT-01',
          message: `Unsupported target profile "${targetProfile}". Supported: EN16931, PEPPOL-BIS-3.0, XRECHNUNG-3.0`,
          severity: 'error',
          remediation_hint: {
            hint_type: 'unsupported_profile',
            description: 'Set target_profile to one of: EN16931, PEPPOL-BIS-3.0, XRECHNUNG-3.0',
          },
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
    deterministic_trace: true,
    engine_version: ENGINE_VERSION,
    rule_pack_version: RULE_PACK_VERSION,
    rule_pack_hash: RULE_PACK_HASH,
    target_profile: targetProfile,
    profile_resolution: profileResolution,
    blocking_errors: violations,
    warnings,
    trace,
    storage_statement: STORAGE_STATEMENT,
  };
}

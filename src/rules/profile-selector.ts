import type { ProfileResolution } from '../types/index.js';
import { RULE_PACK_REGISTRY } from './rule-pack-manifest.js';
import { isSupportedProfile } from './profiles.js';

export function selectRulePack(profile: string): ProfileResolution {
  if (!isSupportedProfile(profile)) {
    return {
      requested: profile,
      resolved: profile,
      rule_pack_id: 'none',
      rule_pack_hash: 'none',
      is_cius: false,
      base_standard: 'unknown',
    };
  }

  const manifest = RULE_PACK_REGISTRY[profile];
  return {
    requested: profile,
    resolved: manifest.profile,
    rule_pack_id: manifest.rule_pack_id,
    rule_pack_hash: manifest.artifact_hash,
    is_cius: manifest.is_cius,
    base_standard: manifest.base_standard,
  };
}

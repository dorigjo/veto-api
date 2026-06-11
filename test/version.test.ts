import { describe, it, expect } from 'vitest';
import app from '../src/index.js';
import { ENGINE_VERSION, RULE_PACK_VERSION } from '../src/lib/version.js';
import { SUPPORTED_PROFILES } from '../src/rules/profiles.js';

describe('GET /v1/version', () => {
  it('returns 200 with version info', async () => {
    const res = await app.request('/v1/version');
    expect(res.status).toBe(200);
    const body = await res.json() as {
      engine_version: string;
      rule_pack_version: string;
      supported_profiles: string[];
    };
    expect(body.engine_version).toBe(ENGINE_VERSION);
    expect(body.rule_pack_version).toBe(RULE_PACK_VERSION);
    expect(body.supported_profiles).toEqual([...SUPPORTED_PROFILES]);
  });

  it('does not require an API key', async () => {
    const res = await app.request('/v1/version');
    expect(res.status).toBe(200);
  });
});

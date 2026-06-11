import { Hono } from 'hono';
import type { AppEnv } from '../types/index.js';
import { ENGINE_VERSION, RULE_PACK_VERSION } from '../lib/version.js';
import { SUPPORTED_PROFILES } from '../rules/profiles.js';

const version = new Hono<AppEnv>();

version.get('/version', (c) => {
  return c.json({
    engine_version: ENGINE_VERSION,
    rule_pack_version: RULE_PACK_VERSION,
    supported_profiles: [...SUPPORTED_PROFILES],
  });
});

export { version };

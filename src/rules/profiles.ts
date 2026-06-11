export const SUPPORTED_PROFILES = ['EN16931', 'PEPPOL-BIS-3.0', 'XRECHNUNG-3.0'] as const;
export type SupportedProfile = (typeof SUPPORTED_PROFILES)[number];

export function isSupportedProfile(profile: string): profile is SupportedProfile {
  return (SUPPORTED_PROFILES as readonly string[]).includes(profile);
}

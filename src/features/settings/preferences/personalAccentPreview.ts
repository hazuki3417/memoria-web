import type { PreferencesSessionSnapshot } from "./personalPreferencesSession"

const validAccent = (value: string): boolean => /^#[0-9A-Fa-f]{6}$/.test(value)

/**
 * Preview only a valid, pending Personal Accent edit.
 * Failed/unknown writes must fall back to the last confirmed value, while
 * keeping the draft in the session for explicit retry or discard.
 */
export function resolvePersonalAccent(
  persisted: string | undefined,
  session: PreferencesSessionSnapshot,
): string | undefined {
  const confirmed = session.confirmed?.personalAccentColor ?? persisted
  if (session.failure) return confirmed
  const draft = session.draftPatch.personalAccentColor
  return draft && validAccent(draft) ? draft.toUpperCase() : confirmed
}

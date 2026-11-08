"use client"

import { useCurrentUserQuery } from "@/infrastructure/graphql/generated"
import { usePersonalPreferencesSession } from "./preferences/PersonalPreferencesSessionContext"
import { resolvePersonalAccent } from "./preferences/personalAccentPreview"

/** Owns the CurrentUser read and Personal accent preview resolution. */
export function usePersonalSettingsReadState() {
  const { snapshot: personalSession } = usePersonalPreferencesSession()
  const { data, loading, error } = useCurrentUserQuery()
  const personalAccentColor = resolvePersonalAccent(
    data?.me?.preferences.personalAccentColor,
    personalSession,
  )
  const loadState = !data?.me ? (loading ? "loading" : "error") : "ready"

  return { data, error, personalAccentColor, loadState }
}

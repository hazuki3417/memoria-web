"use client"

import { usePersonalSettingsAccentQuery } from "@/infrastructure/graphql/generated"
import { usePersonalPreferencesSession } from "../preferences/PersonalPreferencesSessionContext"
import { resolvePersonalAccent } from "../preferences/personalAccentPreview"
import { usePersonalSettingsRefreshError } from "../usePersonalSettingsRefreshError"

/** Only the navigation accent is shared; active Sections own their data. */
export function usePersonalSettingsAccentColor() {
  const { snapshot: personalSession } = usePersonalPreferencesSession()
  const { data, error } = usePersonalSettingsAccentQuery({
    fetchPolicy: "network-only",
  })
  usePersonalSettingsRefreshError(Boolean(data?.me && error))

  return {
    personalAccentColor: resolvePersonalAccent(
      data?.me?.preferences.personalAccentColor,
      personalSession,
    ),
  }
}

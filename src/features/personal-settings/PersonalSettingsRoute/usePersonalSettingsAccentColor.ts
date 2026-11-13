"use client"

import { usePersonalSettingsAccentQuery } from "@/infrastructure/graphql/generated"
import { usePersonalAccentPreview } from "../preferences/PersonalAccentPreviewContext"
import { resolvePersonalAccent } from "../preferences/personalAccentPreview"
import { usePersonalSettingsRefreshError } from "../usePersonalSettingsRefreshError"

/** Only the navigation accent is shared; active Sections own their data. */
export function usePersonalSettingsAccentColor() {
  const personalPreview = usePersonalAccentPreview()
  const { data, error } = usePersonalSettingsAccentQuery({
    fetchPolicy: "network-only",
  })
  usePersonalSettingsRefreshError(Boolean(data?.me && error))

  return {
    personalAccentColor: resolvePersonalAccent(
      data?.me?.preferences.personalAccentColor,
      personalPreview?.color ?? null,
    ),
  }
}

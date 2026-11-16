"use client"

import { usePersonalSettingsAccentQuery } from "@/infrastructure/graphql/generated"
import { resolvePersonalAccent, usePersonalAccentPreview } from "@/features/application-shell"
import { usePersonalSettingsRefreshError } from "../usePersonalSettingsRefreshError"

/** Only the navigation accent is shared; active Sections own their data. */
export const usePersonalSettingsAccentColor = () => {
  const personalPreview = usePersonalAccentPreview()
  const { data, error } = usePersonalSettingsAccentQuery({
    fetchPolicy: "network-only",
    refetchWritePolicy: "merge",
  })
  usePersonalSettingsRefreshError(Boolean(data?.me && error))

  return {
    personalAccentColor: resolvePersonalAccent(
      data?.me?.preferences.personalAccentColor,
      personalPreview?.color ?? null,
    ),
  }
}

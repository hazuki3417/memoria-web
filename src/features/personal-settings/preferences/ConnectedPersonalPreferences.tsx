"use client"

import { useMediaQuery } from "@mantine/hooks"
import { PersonalPreferences } from "./PersonalPreferences"
import { fromGraphqlUserPreferences } from "./userPreferencesGraphqlAdapter"
import { usePersonalPreferencesSave } from "./usePersonalPreferencesSave"
import { usePersonalSettingsInspection } from "../PersonalSettingsRoute/usePersonalSettingsInspection"

/** Preferences固有の保存・確認・GraphQL変換・Viewport依存を接続する。 */
export function ConnectedPersonalPreferences({
  preferences,
}: {
  preferences?: Parameters<typeof fromGraphqlUserPreferences>[0]
}) {
  const { inspectPreferences } = usePersonalSettingsInspection()
  const { savePreferences } = usePersonalPreferencesSave()
  const compact = useMediaQuery("(max-width: 48em)")

  return (
    <PersonalPreferences
      compact={compact}
      initialPreferences={
        preferences ? fromGraphqlUserPreferences(preferences) : undefined
      }
      onSave={savePreferences}
      onInspect={inspectPreferences}
    />
  )
}

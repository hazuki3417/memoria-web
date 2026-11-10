"use client"

import { useMediaQuery } from "@mantine/hooks"
import { PersonalSettingsView } from "../PersonalSettingsView"
import { PersonalPreferences } from "./PersonalPreferences"
import { fromGraphqlUserPreferences } from "./userPreferencesGraphqlAdapter"
import { usePersonalPreferencesSave } from "./usePersonalPreferencesSave"
import { usePersonalSettingsInspection } from "../PersonalSettingsRoute/usePersonalSettingsInspection"
import { usePersonalSettingsReadState } from "../PersonalSettingsRoute/usePersonalSettingsReadState"
import { usePersonalSettingsRefreshError } from "../usePersonalSettingsRefreshError"
import type { PersonalSettingsSection } from "../personalSettingsSections"

/** Preferences固有の保存・確認・Viewport依存を接続する。 */
export function ConnectedPersonalPreferences({
  onSectionChange,
}: {
  onSectionChange: (section: PersonalSettingsSection) => void
}) {
  const { data, error, personalAccentColor, loadState } =
    usePersonalSettingsReadState()
  const { inspectPreferences } = usePersonalSettingsInspection()
  const { savePreferences } = usePersonalPreferencesSave()
  usePersonalSettingsRefreshError(Boolean(data?.me && error))
  const compact = useMediaQuery("(max-width: 48em)")
  const preferences = data?.me
    ? fromGraphqlUserPreferences(data.me.preferences)
    : undefined

  return (
    <PersonalSettingsView
      key="preferences"
      section="preferences"
      onSectionChange={onSectionChange}
      personalAccentColor={personalAccentColor}
      loadState={loadState}
      content={
        <PersonalPreferences
          compact={compact}
          initialPreferences={preferences}
          onSave={savePreferences}
          onInspect={inspectPreferences}
        />
      }
    />
  )
}


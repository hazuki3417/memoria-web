"use client"

import { PageStatusBoundary } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { useSettingsRefreshError } from "../useSettingsRefreshError"
import { usePersonalSettingsReadState } from "../usePersonalSettingsReadState"
import { usePersonalSettingsInspection } from "../usePersonalSettingsInspection"
import { usePersonalSettingsActions } from "../usePersonalSettingsActions"
import { PersonalSettings } from "../PersonalSettings"
import { fromGraphqlUserPreferences } from "../preferences/userPreferencesGraphqlAdapter"

export function ConnectedSettings({
  section,
}: {
  section: "profile" | "preferences"
}) {
  const { data, error, personalAccentColor, loadState } =
    usePersonalSettingsReadState()
  const { inspectProfile, inspectPreferences } = usePersonalSettingsInspection()
  useSettingsRefreshError(Boolean(data?.me && error))
  const { saveProfile, savePreferences } = usePersonalSettingsActions()
  const preferences = data?.me
    ? fromGraphqlUserPreferences(data.me.preferences)
    : undefined
  return (
    <PersonalSettings
      key={section}
      section={section}
      personalAccentColor={personalAccentColor}
      profileNickname={data?.me?.profile.nickname}
      contentOverride={
        loadState !== "ready" ? (
          <PageStatusBoundary state={loadState} label="Personal設定を読み込み中">
            {null}
          </PageStatusBoundary>
        ) : undefined
      }
      initialPreferences={preferences}
      saveProfile={saveProfile}
      inspectProfile={inspectProfile}
      savePreferences={savePreferences}
      inspectPreferences={inspectPreferences}
    />
  )
}

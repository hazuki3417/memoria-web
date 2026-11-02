"use client"

import { PageStatusBoundary } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { useSettingsRefreshError } from "../useSettingsRefreshError"
import { usePersonalSettingsActions } from "../usePersonalSettingsActions"
import { Settings } from "../Settings"
import { fromGraphqlUserPreferences } from "../preferences/userPreferencesGraphqlAdapter"
import { useCurrentUserQuery } from "@/infrastructure/graphql/generated"
import { usePersonalPreferencesSession } from "../preferences/PersonalPreferencesSessionContext"
import { resolvePersonalAccent } from "../preferences/personalAccentPreview"

export function ConnectedSettings({
  section,
}: {
  section: "profile" | "preferences"
}) {
  const { snapshot: personalSession } = usePersonalPreferencesSession()
  const { data, loading, error, refetch } = useCurrentUserQuery()
  useSettingsRefreshError(Boolean(data?.me && error))
  const { saveProfile, savePreferences } = usePersonalSettingsActions()
  const preferences = data?.me
    ? fromGraphqlUserPreferences(data.me.preferences)
    : undefined
  const state = !data?.me ? (loading ? "loading" : "error") : "ready"
  return (
    <Settings
      key={section}
      section={section}
      personalAccentColor={resolvePersonalAccent(
        data?.me?.preferences.personalAccentColor,
        personalSession,
      )}
      profileNickname={data?.me?.profile.nickname}
      contentOverride={
        state !== "ready" ? (
          <PageStatusBoundary state={state} label="Personal設定を読み込み中">
            {null}
          </PageStatusBoundary>
        ) : undefined
      }
      initialPreferences={preferences}
      saveProfile={saveProfile}
      savePreferences={savePreferences}
      inspectPreferences={async () => {
        const current = await refetch()
        if (!current.data?.me) throw new Error("Current User unavailable")
        return fromGraphqlUserPreferences(current.data.me.preferences)
      }}
    />
  )
}

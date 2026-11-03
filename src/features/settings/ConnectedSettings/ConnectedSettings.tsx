"use client"

import { useApolloClient } from "@apollo/client"
import { PageStatusBoundary } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { useSettingsRefreshError } from "../useSettingsRefreshError"
import { usePersonalSettingsActions } from "../usePersonalSettingsActions"
import { Settings } from "../Settings"
import { fromGraphqlUserPreferences } from "../preferences/userPreferencesGraphqlAdapter"
import { CurrentUserDocument, useCurrentUserQuery, type OperationCurrentUserQuery } from "@/infrastructure/graphql/generated"
import { usePersonalPreferencesSession } from "../preferences/PersonalPreferencesSessionContext"
import { resolvePersonalAccent } from "../preferences/personalAccentPreview"

export function ConnectedSettings({
  section,
}: {
  section: "profile" | "preferences"
}) {
  const { snapshot: personalSession } = usePersonalPreferencesSession()
  const { data, loading, error } = useCurrentUserQuery()
  const client = useApolloClient()
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
        // Inspection must not publish stale data to the shared CurrentUser cache.
        const current = await client.query<OperationCurrentUserQuery>({
          query: CurrentUserDocument,
          fetchPolicy: "no-cache",
        })
        if (!current.data?.me) throw new Error("Current User unavailable")
        return fromGraphqlUserPreferences(current.data.me.preferences)
      }}
    />
  )
}

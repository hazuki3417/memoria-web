"use client"

import { useApolloClient } from "@apollo/client"
import { PageStatusBoundary } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { useSettingsRefreshError } from "../useSettingsRefreshError"
import { usePersonalSettingsReadState } from "../usePersonalSettingsReadState"
import { usePersonalSettingsActions } from "../usePersonalSettingsActions"
import { PersonalSettings } from "../PersonalSettings"
import { fromGraphqlUserPreferences } from "../preferences/userPreferencesGraphqlAdapter"
import { CurrentUserDocument, type OperationCurrentUserQuery } from "@/infrastructure/graphql/generated"

export function ConnectedSettings({
  section,
}: {
  section: "profile" | "preferences"
}) {
  const { data, loading, error, personalAccentColor, loadState } =
    usePersonalSettingsReadState()
  const client = useApolloClient()
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
      inspectProfile={async () => {
        // Inspection must not publish stale data to the shared CurrentUser cache.
        const current = await client.query<OperationCurrentUserQuery>({
          query: CurrentUserDocument,
          fetchPolicy: "no-cache",
        })
        if (!current.data?.me) throw new Error("Current User unavailable")
        return current.data.me.profile.nickname
      }}
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

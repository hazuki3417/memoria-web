"use client"

import { SettingsLoadBoundary } from "./SettingsLoadBoundary"
import type { ReactNode } from "react"
import { Settings } from "./Settings"
import type { UserPreferencesPatch } from "./preferences/userPreferences"
import {
  fromGraphqlUserPreferences,
  toGraphqlUserPreferencesPatch,
} from "./preferences/userPreferencesGraphqlAdapter"
import {
  CurrentUserDocument,
  useCurrentUserQuery,
  useSaveUserPreferencesMutation,
  useUpdateMemoriaUserProfileMutation,
} from "@/infrastructure/graphql/generated"

export function ConnectedSettings({
  section,
}: {
  section: "profile" | "preferences"
}) {
  const { data, loading } = useCurrentUserQuery()
  const [updateProfile] = useUpdateMemoriaUserProfileMutation()
  const [updatePreferences] = useSaveUserPreferencesMutation()
  const preferences = data?.me ? fromGraphqlUserPreferences(data.me.preferences) : undefined
  const state = !data?.me ? (loading ? "loading" : "error") : "ready"
  return (
    <Settings
      key={section}
      section={section}
      personalAccentColor={data?.me?.preferences.personalAccentColor}
      profileNickname={data?.me?.profile.nickname}
      contentOverride={state !== "ready" ? <SettingsLoadBoundary state={state} label="Personal設定を読み込み中">{null}</SettingsLoadBoundary> : undefined}
      initialPreferences={preferences}
      saveProfile={async (nickname) => {
        await updateProfile({
          variables: { input: { nickname } },
          refetchQueries: [CurrentUserDocument],
          awaitRefetchQueries: true,
        })
      }}
      savePreferences={async (patch: UserPreferencesPatch) => {
        const input = toGraphqlUserPreferencesPatch(patch)
        const result = await updatePreferences({
          variables: { input },
          refetchQueries: [CurrentUserDocument],
          awaitRefetchQueries: true,
        })
        if (!result.data?.updateUserPreferences.preferences)
          throw new Error("Preferences update unconfirmed")
        return fromGraphqlUserPreferences(
          result.data.updateUserPreferences.preferences,
        )
      }}
    />
  )
}

/** Keep account and usage pages rendered while resolving the personal accent color. */
export function ConnectedPersonalSettingsSection({
  section,
  usageContent,
}: {
  section: "account" | "usage"
  usageContent?: ReactNode
}) {
  const { data, loading, error } = useCurrentUserQuery()
  const accountState = !data?.me ? (loading ? "loading" : "error") : "ready"
  const accountContent = section === "account" && accountState !== "ready"
    ? <SettingsLoadBoundary state={accountState} label="Personal設定を読み込み中">{null}</SettingsLoadBoundary>
    : undefined
  return (
    <Settings
      section={section}
      usageContent={usageContent}
      accountContent={accountContent}
      personalAccentColor={data?.me?.preferences.personalAccentColor}
    />
  )
}

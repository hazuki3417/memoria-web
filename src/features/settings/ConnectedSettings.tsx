"use client"

import { Text } from "@mantine/core"
import { LoadingBoundary } from "@/components/LoadingBoundary/LoadingBoundary"
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
  const { data, loading, error } = useCurrentUserQuery()
  const [updateProfile] = useUpdateMemoriaUserProfileMutation()
  const [updatePreferences] = useSaveUserPreferencesMutation()
  if (loading && !data)
    return (
      <LoadingBoundary loading label="Personal設定を読み込み中">
        {null}
      </LoadingBoundary>
    )
  if (error || !data?.me)
    return (
      <Text c="red">設定を取得できませんでした。再読み込みしてください。</Text>
    )

  const preferences = fromGraphqlUserPreferences(data.me.preferences)
  return (
    <Settings
      key={section}
      section={section}
      personalAccentColor={data.me.preferences.personalAccentColor}
      profileNickname={data.me.profile.nickname}
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
  const accountContent =
    section === "account"
      ? !data?.me && loading
        ? <LoadingBoundary loading label="Personal設定を読み込み中">{null}</LoadingBoundary>
        : !data?.me && (error || !loading)
          ? <Text c="red">設定を取得できませんでした。再読み込みしてください。</Text>
          : undefined
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

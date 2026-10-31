"use client"

import { PageStatusBoundary } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { useSettingsRefreshError } from "./useSettingsRefreshError"
import { usePersonalSettingsActions } from "./usePersonalSettingsActions"
import type { ReactNode } from "react"
import { Settings } from "./Settings"
import {
  fromGraphqlUserPreferences,
} from "./preferences/userPreferencesGraphqlAdapter"
import {
  useCurrentUserQuery,
} from "@/infrastructure/graphql/generated"

export function ConnectedSettings({
  section,
}: {
  section: "profile" | "preferences"
}) {
  const { data, loading, error } = useCurrentUserQuery()
  useSettingsRefreshError(Boolean(data?.me && error))
  const { saveProfile, savePreferences } = usePersonalSettingsActions()
  const preferences = data?.me ? fromGraphqlUserPreferences(data.me.preferences) : undefined
  const state = !data?.me ? (loading ? "loading" : "error") : "ready"
  return (
    <Settings
      key={section}
      section={section}
      personalAccentColor={data?.me?.preferences.personalAccentColor}
      profileNickname={data?.me?.profile.nickname}
      contentOverride={state !== "ready" ? <PageStatusBoundary state={state} label="Personal設定を読み込み中">{null}</PageStatusBoundary> : undefined}
      initialPreferences={preferences}
      saveProfile={saveProfile}
      savePreferences={savePreferences}
    />
  )
}

/** Account requires CurrentUser; Usage handles its own data and loading state. */
export function ConnectedPersonalSettingsSection({
  section,
  usageContent,
}: {
  section: "account" | "usage"
  usageContent?: ReactNode
}) {
  const { data, loading, error } = useCurrentUserQuery()
  useSettingsRefreshError(Boolean(data?.me && error))
  const accountState = !data?.me ? (loading ? "loading" : "error") : "ready"
  const accountContent = section === "account" && accountState !== "ready"
    ? <PageStatusBoundary state={accountState} label="Personal設定を読み込み中">{null}</PageStatusBoundary>
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

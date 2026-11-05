"use client"

import type { ReactNode } from "react"
import { PageStatusBoundary } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { useSettingsRefreshError } from "../../useSettingsRefreshError"
import { Settings } from ".."
import { useCurrentUserQuery } from "@/infrastructure/graphql/generated"
import { usePersonalPreferencesSession } from "../../preferences/PersonalPreferencesSessionContext"
import { resolvePersonalAccent } from "../../preferences/personalAccentPreview"

/** Account requires CurrentUser; Usage handles its own data and loading state. */
export function ConnectedPersonalSettingsSection({
  section,
  usageContent,
}: {
  section: "account" | "usage"
  usageContent?: ReactNode
}) {
  const { snapshot: personalSession } = usePersonalPreferencesSession()
  const { data, loading, error } = useCurrentUserQuery()
  useSettingsRefreshError(Boolean(data?.me && error))
  const accountState = !data?.me ? (loading ? "loading" : "error") : "ready"
  const accountContent =
    section === "account" && accountState !== "ready" ? (
      <PageStatusBoundary state={accountState} label="Personal設定を読み込み中">
        {null}
      </PageStatusBoundary>
    ) : undefined
  return (
    <Settings
      section={section}
      usageContent={usageContent}
      accountContent={accountContent}
      personalAccentColor={resolvePersonalAccent(
        data?.me?.preferences.personalAccentColor,
        personalSession,
      )}
    />
  )
}

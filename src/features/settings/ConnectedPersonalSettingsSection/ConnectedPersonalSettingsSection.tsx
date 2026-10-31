"use client"

import type { ReactNode } from "react"
import { PageStatusBoundary } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { useSettingsRefreshError } from "../useSettingsRefreshError"
import { Settings } from "../Settings"
import { useCurrentUserQuery } from "@/infrastructure/graphql/generated"

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

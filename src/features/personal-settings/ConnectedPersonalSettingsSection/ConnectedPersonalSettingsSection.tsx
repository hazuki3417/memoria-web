"use client"

import type { ReactNode } from "react"
import { PageStatusBoundary } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { useSettingsRefreshError } from "../useSettingsRefreshError"
import { usePersonalSettingsReadState } from "../usePersonalSettingsReadState"
import { PersonalSettings } from "../PersonalSettings"

/** Account requires CurrentUser; Usage handles its own data and loading state. */
export function ConnectedPersonalSettingsSection({
  section,
  usageContent,
}: {
  section: "account" | "usage"
  usageContent?: ReactNode
}) {
  const { data, error, personalAccentColor, loadState } =
    usePersonalSettingsReadState()
  useSettingsRefreshError(Boolean(data?.me && error))
  const accountContent =
    section === "account" && loadState !== "ready" ? (
      <PageStatusBoundary state={loadState} label="Personal設定を読み込み中">
        {null}
      </PageStatusBoundary>
    ) : undefined
  return (
    <PersonalSettings
      section={section}
      usageContent={usageContent}
      accountContent={accountContent}
      personalAccentColor={personalAccentColor}
    />
  )
}

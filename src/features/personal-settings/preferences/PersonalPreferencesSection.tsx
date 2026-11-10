"use client"

import type { ComponentProps } from "react"
import { SettingsContentStatus } from "@/components/SettingsContentStatus/SettingsContentStatus"
import type { PageStatus } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { PersonalPreferences } from "./PersonalPreferences"

/** Preferencesの取得状態と既存Form・Preview UIを構成する。 */
export function PersonalPreferencesSection({
  status,
  ...preferencesProps
}: { status: PageStatus } & ComponentProps<typeof PersonalPreferences>) {
  return (
    <SettingsContentStatus state={status} label="Personal設定を読み込み中">
      <PersonalPreferences {...preferencesProps} />
    </SettingsContentStatus>
  )
}

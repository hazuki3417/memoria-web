"use client"

import type { ComponentProps } from "react"
import { SettingsContentStatus } from "@/components/SettingsContentStatus/SettingsContentStatus"
import type { PageStatus } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { PersonalProfile } from "./PersonalProfile"

/** Profileの取得状態と既存Form UIのCompositionを所有する。 */
export function PersonalProfileSection({
  status,
  ...profileProps
}: { status: PageStatus } & ComponentProps<typeof PersonalProfile>) {
  return (
    <SettingsContentStatus state={status} label="Personal設定を読み込み中">
      <PersonalProfile {...profileProps} />
    </SettingsContentStatus>
  )
}

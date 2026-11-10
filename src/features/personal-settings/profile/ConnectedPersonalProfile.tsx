"use client"

import type { PageStatus } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { PersonalProfileSection } from "./PersonalProfileSection"
import { usePersonalProfileSave } from "./usePersonalProfileSave"
import { usePersonalSettingsInspection } from "../PersonalSettingsRoute/usePersonalSettingsInspection"

/** Profile固有の保存・確認ActionをSectionへ接続する。 */
export function ConnectedPersonalProfile({
  status,
  initialNickname,
}: {
  status: PageStatus
  initialNickname?: string
}) {
  const { inspectProfile } = usePersonalSettingsInspection()
  const { saveProfile } = usePersonalProfileSave()

  return (
    <PersonalProfileSection
      status={status}
      onSave={saveProfile}
      onInspect={inspectProfile}
      initialNickname={initialNickname}
    />
  )
}

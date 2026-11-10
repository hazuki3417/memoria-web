"use client"

import { PersonalProfile } from "./PersonalProfile"
import { usePersonalProfileSave } from "./usePersonalProfileSave"
import { usePersonalSettingsInspection } from "../PersonalSettingsRoute/usePersonalSettingsInspection"

/** Profile固有の保存・確認ActionをSectionへ接続する。 */
export function ConnectedPersonalProfile({
  initialNickname,
}: {
  initialNickname?: string
}) {
  const { inspectProfile } = usePersonalSettingsInspection()
  const { saveProfile } = usePersonalProfileSave()

  return (
    <PersonalProfile
      onSave={saveProfile}
      onInspect={inspectProfile}
      initialNickname={initialNickname}
    />
  )
}

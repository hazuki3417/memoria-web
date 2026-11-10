"use client"

import { PersonalSettingsView } from "../PersonalSettingsView"
import { PersonalProfile } from "./PersonalProfile"
import { usePersonalProfileSave } from "./usePersonalProfileSave"
import { usePersonalSettingsInspection } from "../PersonalSettingsRoute/usePersonalSettingsInspection"
import { usePersonalSettingsReadState } from "../PersonalSettingsRoute/usePersonalSettingsReadState"
import { usePersonalSettingsRefreshError } from "../usePersonalSettingsRefreshError"
import type { PersonalSettingsSection } from "../personalSettingsSections"

/** Profile固有の保存・確認を接続する。共通CurrentUser取得とPreview解決は維持。 */
export function ConnectedPersonalProfile({
  onSectionChange,
}: {
  onSectionChange: (section: PersonalSettingsSection) => void
}) {
  const { data, error, personalAccentColor, loadState } =
    usePersonalSettingsReadState()
  const { inspectProfile } = usePersonalSettingsInspection()
  const { saveProfile } = usePersonalProfileSave()
  usePersonalSettingsRefreshError(Boolean(data?.me && error))

  return (
    <PersonalSettingsView
      key="profile"
      section="profile"
      onSectionChange={onSectionChange}
      personalAccentColor={personalAccentColor}
      loadState={loadState}
      content={
        <PersonalProfile
          onSave={saveProfile}
          onInspect={inspectProfile}
          initialNickname={data?.me?.profile.nickname}
        />
      }
    />
  )
}


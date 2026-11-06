"use client"

import type { ReactNode } from "react"
import { SettingsLayout, type Section } from "../../SettingsLayout"
import { SettingsSectionContent } from "../SettingsSectionContent"
import type { InspectProfile, SaveProfile } from "../../profile/SettingsProfile"
import type {
  UserPreferences,
  UserPreferencesPatch,
} from "../../preferences/userPreferences"

export type SettingsViewProps = {
  section: Section
  saveProfile?: SaveProfile
  inspectProfile?: InspectProfile
  profileNickname?: string
  initialPreferences?: UserPreferences
  savePreferences?: (patch: UserPreferencesPatch) => Promise<UserPreferences>
  inspectPreferences?: () => Promise<UserPreferences>
  usageContent?: ReactNode
  accountContent?: ReactNode
  contentOverride?: ReactNode
  personalAccentColor?: string
  onSectionChange: (section: Section) => void
}

export function SettingsView({
  section,
  saveProfile,
  inspectProfile,
  profileNickname,
  initialPreferences,
  savePreferences,
  inspectPreferences,
  usageContent,
  accountContent,
  contentOverride,
  personalAccentColor,
  onSectionChange,
}: SettingsViewProps) {
  return (
    <SettingsLayout
      accentColor={personalAccentColor}
      section={section}
      onSectionChange={onSectionChange}
    >
      {contentOverride ?? (
        <SettingsSectionContent
          section={section}
          saveProfile={saveProfile}
          inspectProfile={inspectProfile}
          profileNickname={profileNickname}
          initialPreferences={initialPreferences}
          savePreferences={savePreferences}
          inspectPreferences={inspectPreferences}
          usageContent={usageContent}
          accountContent={accountContent}
        />
      )}
    </SettingsLayout>
  )
}

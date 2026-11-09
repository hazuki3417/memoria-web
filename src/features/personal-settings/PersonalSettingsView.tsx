"use client"

import type { ReactNode } from "react"
import { PersonalSettingsLayout } from "./PersonalSettingsLayout"
import type { PersonalSettingsSection } from "./personalSettingsSections"
import { PersonalSettingsContent } from "./PersonalSettingsContent"
import type { InspectProfile, SaveProfile } from "./profile/SettingsProfile"
import type {
  UserPreferences,
  UserPreferencesPatch,
} from "./preferences/userPreferences"

export type PersonalSettingsViewProps = {
  section: PersonalSettingsSection
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
  onSectionChange: (section: PersonalSettingsSection) => void
}

export function PersonalSettingsView({
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
}: PersonalSettingsViewProps) {
  return (
    <PersonalSettingsLayout
      accentColor={personalAccentColor}
      section={section}
      onSectionChange={onSectionChange}
    >
      {contentOverride ?? (
        <PersonalSettingsContent
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
    </PersonalSettingsLayout>
  )
}

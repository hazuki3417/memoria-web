"use client"

import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { SettingsLayout, type Section } from "../SettingsLayout"
import { SettingsSectionContent } from "./SettingsSectionContent"
import type { InspectProfile, SaveProfile } from "../profile/SettingsProfile"
import type {
  UserPreferences,
  UserPreferencesPatch,
} from "../preferences/userPreferences"

export function Settings({
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
}: {
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
}) {
  const router = useRouter()
  return (
    <SettingsLayout
      accentColor={personalAccentColor}
      section={section}
      onSectionChange={(next) => router.push(`/settings/${next}`)}
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

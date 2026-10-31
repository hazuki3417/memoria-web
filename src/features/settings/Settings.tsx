"use client"

import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { SettingsLayout, type Section } from "./SettingsLayout"
import { SettingsSectionContent } from "./SettingsSectionContent"
import type { SaveProfile } from "./profile/SettingsProfile"
import type { UserPreferences, UserPreferencesPatch } from "./preferences/userPreferences"

export function Settings({
  section,
  saveProfile,
  profileNickname,
  initialPreferences,
  savePreferences,
  usageContent,
  accountContent,
  contentOverride,
  personalAccentColor,
}: {
  section: Section
  saveProfile?: SaveProfile
  profileNickname?: string
  initialPreferences?: UserPreferences
  savePreferences?: (patch: UserPreferencesPatch) => Promise<UserPreferences>
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
          profileNickname={profileNickname}
          initialPreferences={initialPreferences}
          savePreferences={savePreferences}
          usageContent={usageContent}
          accountContent={accountContent}
        />
      )}
    </SettingsLayout>
  )
}

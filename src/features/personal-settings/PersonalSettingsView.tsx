"use client"

import { useMediaQuery } from "@mantine/hooks"
import type { ReactNode } from "react"
import { PersonalSettingsLayout } from "./PersonalSettingsLayout"
import type { PersonalSettingsSection } from "./personalSettingsSections"
import { Account } from "./account"
import { PersonalPreferences } from "./preferences"
import { PersonalProfile } from "./profile"
import type { InspectProfile, SaveProfile } from "./profile"
import type {
  UserPreferences,
  UserPreferencesPatch,
} from "./preferences/userPreferences"

// No production persistence should be simulated when the callback is absent.
async function unavailableProfileSave(): Promise<void> {
  throw new Error("Profile save unavailable")
}

export type PersonalSettingsViewProps = {
  section: PersonalSettingsSection
  saveProfile?: SaveProfile
  inspectProfile?: InspectProfile
  profileNickname?: string
  initialPreferences?: UserPreferences
  savePreferences?: (patch: UserPreferencesPatch) => Promise<UserPreferences>
  inspectPreferences?: () => Promise<UserPreferences>
  usageContent?: ReactNode
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
  contentOverride,
  personalAccentColor,
  onSectionChange,
}: PersonalSettingsViewProps) {
  const compact = useMediaQuery("(max-width: 48em)")
  let content: ReactNode

  switch (section) {
    case "profile":
      content = (
        <PersonalProfile
          onSave={saveProfile ?? unavailableProfileSave}
          onInspect={inspectProfile}
          initialNickname={profileNickname}
        />
      )
      break
    case "preferences":
      content = (
        <PersonalPreferences
          compact={compact}
          initialPreferences={initialPreferences}
          onSave={savePreferences}
          onInspect={inspectPreferences}
        />
      )
      break
    case "usage":
      content = <>{usageContent ?? null}</>
      break
    case "account":
      content = <Account />
      break
  }

  return (
    <PersonalSettingsLayout
      accentColor={personalAccentColor}
      section={section}
      onSectionChange={onSectionChange}
    >
      {contentOverride ?? content}
    </PersonalSettingsLayout>
  )
}

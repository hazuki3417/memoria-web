"use client"

import { useMediaQuery } from "@mantine/hooks"
import type { ReactNode } from "react"
import type { PersonalSettingsSection } from "../personalSettingsSections"
import { PersonalProfile, type InspectProfile, type SaveProfile } from "../profile"
import { PersonalPreferences } from "../preferences"
import { PersonalAccount } from "../account"
import type {
  UserPreferences,
  UserPreferencesPatch,
} from "../preferences/userPreferences"

// No production persistence should be simulated when the callback is absent.
async function unavailableProfileSave(): Promise<void> {
  throw new Error("Profile save unavailable")
}

export type PersonalSettingsContentProps = {
  section: PersonalSettingsSection
  saveProfile?: SaveProfile
  inspectProfile?: InspectProfile
  profileNickname?: string
  initialPreferences?: UserPreferences
  savePreferences?: (patch: UserPreferencesPatch) => Promise<UserPreferences>
  inspectPreferences?: () => Promise<UserPreferences>
  usageContent?: ReactNode
  accountContent?: ReactNode
}

/** Selects the existing section UI without owning routing, data fetching or page layout. */
export function PersonalSettingsContent({
  section,
  saveProfile,
  inspectProfile,
  profileNickname,
  initialPreferences,
  savePreferences,
  inspectPreferences,
  usageContent,
  accountContent,
}: PersonalSettingsContentProps) {
  const compact = useMediaQuery("(max-width: 48em)")
  switch (section) {
    case "profile":
      return (
        <PersonalProfile
          onSave={saveProfile ?? unavailableProfileSave}
          onInspect={inspectProfile}
          initialNickname={profileNickname}
        />
      )
    case "preferences":
      return (
        <PersonalPreferences
          compact={compact}
          initialPreferences={initialPreferences}
          onSave={savePreferences}
          onInspect={inspectPreferences}
        />
      )
    case "usage":
      return <>{usageContent ?? null}</>
    case "account":
      return (
        <>
          {accountContent ?? (
            <PersonalAccount />
          )}
        </>
      )
  }
}

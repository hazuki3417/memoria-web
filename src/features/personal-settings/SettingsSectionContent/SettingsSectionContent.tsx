"use client"

import { Button } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import Link from "next/link"
import type { ReactNode } from "react"
import type { Section } from "../SettingsLayout"
import { SettingsProfile, type InspectProfile, type SaveProfile } from "../profile/SettingsProfile"
import { SettingsPreferences } from "../preferences/SettingsPreferences"
import { SettingsAccount } from "../account/SettingsAccount"
import type {
  UserPreferences,
  UserPreferencesPatch,
} from "../preferences/userPreferences"

// No production persistence should be simulated when the callback is absent.
async function unavailableProfileSave(): Promise<void> {
  throw new Error("Profile save unavailable")
}

export type SettingsSectionContentProps = {
  section: Section
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
export function SettingsSectionContent({
  section,
  saveProfile,
  inspectProfile,
  profileNickname,
  initialPreferences,
  savePreferences,
  inspectPreferences,
  usageContent,
  accountContent,
}: SettingsSectionContentProps) {
  const compact = useMediaQuery("(max-width: 48em)")
  switch (section) {
    case "profile":
      return (
        <SettingsProfile
          onSave={saveProfile ?? unavailableProfileSave}
          onInspect={inspectProfile}
          initialNickname={profileNickname}
        />
      )
    case "preferences":
      return (
        <SettingsPreferences
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
            <SettingsAccount
              deletionAction={
                <Button
                  component={Link}
                  href="/settings/account/delete"
                  color="red"
                  size="sm"
                >
                  アカウントを削除する
                </Button>
              }
            />
          )}
        </>
      )
  }
}

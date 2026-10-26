"use client"

import { Button } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { SettingsLayout, type Section } from "./SettingsLayout"
import { SettingsProfile, type SaveProfile } from "./profile/SettingsProfile"
import { SettingsPreferences } from "./preferences/SettingsPreferences"
import { SettingsAccount } from "./account/SettingsAccount"
import type { UserPreferences, UserPreferencesPatch } from "./preferences/userPreferences"

export function Settings({
  section,
  saveProfile,
  profileNickname,
  initialPreferences,
  savePreferences,
  usageContent,
}: {
  section: Section
  saveProfile?: SaveProfile
  profileNickname?: string
  initialPreferences?: UserPreferences
  savePreferences?: (patch: UserPreferencesPatch) => Promise<UserPreferences>
  usageContent?: ReactNode
}) {
  const router = useRouter()
  const compact = useMediaQuery("(max-width: 48em)")
  let content: ReactNode
  switch (section) {
    case "profile":
      content = (
        <SettingsProfile onSave={saveProfile} initialNickname={profileNickname} />
      )
      break
    case "preferences":
      content = (
        <SettingsPreferences
          compact={compact}
          initialPreferences={initialPreferences}
          onSave={savePreferences}
        />
      )
      break
    case "usage":
      content = usageContent ?? null
      break
    case "account":
      content = (
        <SettingsAccount
          deletionAction={
            <Button component={Link} href="/settings/account/delete" color="red" size="sm">
              アカウントを削除する
            </Button>
          }
        />
      )
      break
  }

  return (
    <SettingsLayout section={section} onSectionChange={(next) => router.push(`/settings/${next}`)}>
      {content}
    </SettingsLayout>
  )
}

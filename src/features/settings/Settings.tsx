"use client"

import { Button } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { SettingsLayout, type Section } from "./SettingsLayout"
import { SettingsProfile } from "./SettingsProfile"
import { SettingsPreferences } from "./SettingsPreferences"
import { SettingsAccount } from "./SettingsAccount"
import { SettingsUsage, type SettingsUsageData } from "./SettingsUsage"
import type { UserPreferences, UserPreferencesPatch } from "./userPreferences"

const MOCK_USAGE: SettingsUsageData = {
  usedBytes: 1_240_000_000, limitBytes: 5_000_000_000, mediaCount: 1248,
  formatBreakdown: [
    { format: "JPEG", count: 900, sizeBytes: 900_000_000 },
    { format: "PNG", count: 200, sizeBytes: 200_000_000 },
    { format: "WebP", count: 100, sizeBytes: 100_000_000 },
    { format: "HEIC / HEIF", count: 48, sizeBytes: 40_000_000 },
  ],
}

function UsageContent({ fileSizeUnit }: { fileSizeUnit: UserPreferences["fileSizeUnit"] }) {
  return <SettingsUsage usage={MOCK_USAGE} fileSizeUnit={fileSizeUnit} />
}

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
  const content = section === "profile" ? (
    <SettingsProfile onSave={saveProfile} initialNickname={profileNickname} />
  ) : section === "preferences" ? (
    <SettingsPreferences compact={compact} initialPreferences={initialPreferences} onSave={savePreferences} />
  ) : section === "usage" ? (
    usageContent ?? <UsageContent fileSizeUnit={initialPreferences?.fileSizeUnit ?? "DECIMAL"} />
  ) : (
    <SettingsAccount deletionAction={<Button component={Link} href="/settings/account/delete" color="red" size="sm">アカウントを削除する</Button>} />
  )
  return <SettingsLayout section={section} onSectionChange={(next) => router.push(`/settings/${next}`)}>{content}</SettingsLayout>
}

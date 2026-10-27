"use client"

import {
  IconChartBar,
  IconSettings,
  IconUser,
  IconUserCircle,
} from "@tabler/icons-react"
import { SettingsSectionNavigation } from "@/components/SettingsSectionLayout"

export type SettingsSection = "profile" | "account" | "preferences" | "usage"

const sections = [
  { id: "profile", label: "プロフィール", icon: IconUser },
  { id: "account", label: "アカウント", icon: IconUserCircle },
  { id: "preferences", label: "環境設定", icon: IconSettings },
  { id: "usage", label: "利用状況", icon: IconChartBar },
] satisfies { id: SettingsSection; label: string; icon: typeof IconUser }[]

type SettingsNavigationProps = {
  section: SettingsSection
  compact: boolean
  onSectionChange: (section: SettingsSection) => void
}

export function SettingsNavigation({
  section,
  compact,
  onSectionChange,
}: SettingsNavigationProps) {
  return (
    <SettingsSectionNavigation
      section={section}
      sections={sections}
      compact={compact}
      ariaLabel="設定画面"
      desktopAriaLabel="設定"
      accentColor="var(--mantine-color-blue-6)"
      onSectionChange={onSectionChange}
    />
  )
}

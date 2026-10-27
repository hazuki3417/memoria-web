"use client"

import { useMediaQuery } from "@mantine/hooks"
import {
  IconChartBar,
  IconSettings,
  IconUser,
  IconUserCircle,
} from "@tabler/icons-react"
import type { ReactNode } from "react"
import {
  SettingsSectionLayout,
  SettingsSectionNavigation,
} from "@/components/SettingsSectionLayout"

export type Section = "profile" | "account" | "preferences" | "usage"

const sections = [
  { id: "profile", label: "プロフィール", icon: IconUser },
  { id: "account", label: "アカウント", icon: IconUserCircle },
  { id: "preferences", label: "環境設定", icon: IconSettings },
  { id: "usage", label: "利用状況", icon: IconChartBar },
] satisfies { id: Section; label: string; icon: typeof IconUser }[]

type SettingsLayoutProps = {
  section: Section
  onSectionChange: (section: Section) => void
  children: ReactNode
}

export function SettingsLayout({
  section,
  onSectionChange,
  children,
}: SettingsLayoutProps) {
  const compact = useMediaQuery("(max-width: 48em)")

  return (
    <SettingsSectionLayout
      compact={compact}
      navigation={
        <SettingsSectionNavigation
          section={section}
          sections={sections}
          compact={compact}
          ariaLabel="設定画面"
          desktopAriaLabel="設定"
          accentColor="var(--mantine-color-blue-6)"
          onSectionChange={onSectionChange}
        />
      }
    >
      {children}
    </SettingsSectionLayout>
  )
}

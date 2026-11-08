"use client"

import { useMediaQuery } from "@mantine/hooks"
import type { ReactNode } from "react"
import {
  SettingsSectionLayout,
  SettingsSectionNavigation,
} from "@/components/SettingsSectionLayout"

import { personalSettingsSections, type PersonalSettingsSection } from "../personalSettingsSections"

type PersonalSettingsLayoutProps = {
  section: PersonalSettingsSection
  onSectionChange: (section: PersonalSettingsSection) => void
  children: ReactNode
  accentColor?: string
}

export function PersonalSettingsLayout({
  section,
  onSectionChange,
  children,
  accentColor,
}: PersonalSettingsLayoutProps) {
  const compact = useMediaQuery("(max-width: 48em)")

  return (
    <SettingsSectionLayout
      compact={compact}
      navigation={
        <SettingsSectionNavigation
          section={section}
          sections={personalSettingsSections}
          compact={compact}
          ariaLabel="設定画面"
          desktopAriaLabel="設定"
          accentColor={accentColor ?? "var(--mantine-color-blue-6)"}
          onSectionChange={onSectionChange}
        />
      }
    >
      {children}
    </SettingsSectionLayout>
  )
}

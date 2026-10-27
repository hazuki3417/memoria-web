"use client"

import { useMediaQuery } from "@mantine/hooks"
import type { ReactNode } from "react"
import { SettingsSectionLayout } from "@/components/SettingsSectionLayout"
import { SettingsNavigation, type SettingsSection } from "./SettingsNavigation"

export type Section = SettingsSection

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
        <SettingsNavigation
          section={section}
          compact={compact}
          onSectionChange={onSectionChange}
        />
      }
    >
      {children}
    </SettingsSectionLayout>
  )
}

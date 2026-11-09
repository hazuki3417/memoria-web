"use client"

import { useMediaQuery } from "@mantine/hooks"
import type { ReactNode } from "react"
import {
  SettingsSectionLayout,
  SettingsSectionNavigation,
} from "@/components/SettingsSectionLayout"
import {
  getCommunitySettingsSections,
  type CommunitySettingsSection,
} from "../communitySettingsSections"

type CommunitySettingsLayoutProps = {
  communityId: string
  section: CommunitySettingsSection
  onSectionChange: (section: CommunitySettingsSection) => void
  accentColor?: string
  children: ReactNode
}

/** Owns Community-specific navigation and responsive layout, not form or route state. */
export function CommunitySettingsLayout({
  communityId,
  section,
  onSectionChange,
  accentColor,
  children,
}: CommunitySettingsLayoutProps) {
  const compact = useMediaQuery("(max-width: 48em)")
  const sections = getCommunitySettingsSections(communityId)

  return (
    <SettingsSectionLayout
      compact={compact}
      navigation={
        <SettingsSectionNavigation
          section={section}
          sections={sections}
          compact={compact}
          ariaLabel="Community設定画面"
          desktopAriaLabel="Community設定"
          accentColor={accentColor ?? "var(--mantine-color-violet-6)"}
          onSectionChange={onSectionChange}
        />
      }
    >
      {children}
    </SettingsSectionLayout>
  )
}

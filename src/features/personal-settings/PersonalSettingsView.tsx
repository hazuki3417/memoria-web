"use client"

import type { ReactNode } from "react"
import { SettingsContentStatus } from "@/components/SettingsContentStatus/SettingsContentStatus"
import type { PageStatus } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { PersonalSettingsLayout } from "./PersonalSettingsLayout"
import type { PersonalSettingsSection } from "./personalSettingsSections"

export type PersonalSettingsViewProps = {
  section: PersonalSettingsSection
  content: ReactNode
  loadState?: PageStatus
  personalAccentColor?: string
  onSectionChange: (section: PersonalSettingsSection) => void
}

/** Displays the selected Section without owning data or Section composition. */
export function PersonalSettingsView({
  section,
  content,
  loadState = "ready",
  personalAccentColor,
  onSectionChange,
}: PersonalSettingsViewProps) {
  return (
    <PersonalSettingsLayout
      accentColor={personalAccentColor}
      section={section}
      onSectionChange={onSectionChange}
    >
      <SettingsContentStatus state={loadState} label="Personal設定を読み込み中">
        {content}
      </SettingsContentStatus>
    </PersonalSettingsLayout>
  )
}

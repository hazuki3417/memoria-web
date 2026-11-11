"use client"

import type { ReactNode } from "react"
import { PersonalSettingsLayout } from "./PersonalSettingsLayout"
import type { PersonalSettingsSection } from "./personalSettingsSections"

export type PersonalSettingsViewProps = {
  section: PersonalSettingsSection
  content: ReactNode
  personalAccentColor?: string
  onSectionChange: (section: PersonalSettingsSection) => void
}

/** Layoutへの接続のみを所有し、各Sectionの取得状態は解釈しない。 */
export function PersonalSettingsView({
  section,
  content,
  personalAccentColor,
  onSectionChange,
}: PersonalSettingsViewProps) {
  return (
    <PersonalSettingsLayout
      accentColor={personalAccentColor}
      section={section}
      onSectionChange={onSectionChange}
    >
      {content}
    </PersonalSettingsLayout>
  )
}

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

/** Production・Storybook・Prototypeから画面UIへ接続する境界。Sectionの取得や遷移の実行は利用側が所有する。 */
export const PersonalSettingsView = ({
  section,
  content,
  personalAccentColor,
  onSectionChange,
}: PersonalSettingsViewProps) => {
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

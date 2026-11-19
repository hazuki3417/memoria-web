"use client"

import type { ReactNode } from "react"
import { CommunitySettingsLayout } from "./CommunitySettingsLayout"
import type { CommunitySettingsSection } from "./communitySettingsSections"

export type CommunitySettingsViewProps = {
  communityId: string
  section: CommunitySettingsSection
  content: ReactNode
  communityAccentColor?: string
  onSectionChange: (section: CommunitySettingsSection) => void
}

/** Production・Storybook・Prototypeから画面UIへ接続する境界。Sectionの取得や遷移の実行は利用側が所有する。 */
export const CommunitySettingsView = ({
  communityId,
  section,
  content,
  communityAccentColor,
  onSectionChange,
}: CommunitySettingsViewProps) => {
  return (
    <CommunitySettingsLayout
      communityId={communityId}
      section={section}
      accentColor={communityAccentColor}
      onSectionChange={onSectionChange}
    >
      {content}
    </CommunitySettingsLayout>
  )
}

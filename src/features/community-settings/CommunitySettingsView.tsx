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

/** Layoutへの接続のみを所有し、各Sectionの取得状態は解釈しない。 */
export function CommunitySettingsView({
  communityId,
  section,
  content,
  communityAccentColor,
  onSectionChange,
}: CommunitySettingsViewProps) {
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

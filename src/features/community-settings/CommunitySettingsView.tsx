"use client"

import type { ReactNode } from "react"
import { SettingsContentStatus } from "@/components/SettingsContentStatus/SettingsContentStatus"
import type { PageStatus } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { CommunitySettingsLayout } from "./CommunitySettingsLayout"
import type { CommunitySettingsSection } from "./communitySettingsSections"

export type CommunitySettingsViewProps = {
  communityId: string
  section: CommunitySettingsSection
  content: ReactNode
  loadState?: PageStatus
  communityAccentColor?: string
  onSectionChange: (section: CommunitySettingsSection) => void
}

/** Displays the selected Section without owning data, Form or Preview composition. */
export function CommunitySettingsView({
  communityId,
  section,
  content,
  loadState = "ready",
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
      <SettingsContentStatus state={loadState} label="Community設定を読み込み中">
        {content}
      </SettingsContentStatus>
    </CommunitySettingsLayout>
  )
}

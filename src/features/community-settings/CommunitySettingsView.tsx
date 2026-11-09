"use client"

import type { ReactNode } from "react"
import { CommunitySettingsLayout } from "./CommunitySettingsLayout"
import {
  CommunitySettingsContent,
  type CommunitySettingsContentProps,
} from "./CommunitySettingsContent"
import type { CommunitySettingsSection } from "./communitySettingsSections"

export type CommunitySettingsViewProps = CommunitySettingsContentProps & {
  contentOverride?: ReactNode
  accentColor?: string
  onSectionChange: (section: CommunitySettingsSection, href: string) => void
}

/** Composes the existing layout and section UI without owning form, preview or route state. */
export function CommunitySettingsView({
  section,
  communityId,
  contentOverride,
  accentColor,
  onSectionChange,
  ...contentProps
}: CommunitySettingsViewProps) {
  return (
    <CommunitySettingsLayout
      communityId={communityId}
      section={section}
      accentColor={accentColor}
      onSectionChange={onSectionChange}
    >
      {contentOverride ?? (
        <CommunitySettingsContent
          {...contentProps}
          section={section}
          communityId={communityId}
        />
      )}
    </CommunitySettingsLayout>
  )
}

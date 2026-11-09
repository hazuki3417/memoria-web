"use client"

import { useState } from "react"
import { CommunitySettings, type CommunitySettingsProps } from "./CommunitySettings"
import { CommunityPreferencesContent } from "./preferences/CommunityPreferencesContent"
import { useCommunityStoryInvitation } from "./useCommunityStoryInvitation"
import type { CommunitySettingsSection } from "./communitySettingsSections"

/**
 * Storybook-only adapter: keeps section changes inside Canvas.
 * Production route navigation is supplied independently by CommunitySettingsRoute.
 */
export function CommunitySettingsStoryNavigation({
  section = "general",
  onSectionChange: _onSectionChange,
  preferencesContent,
  invitationMode = "preview",
  invitation: suppliedInvitation,
  ...props
}: CommunitySettingsProps) {
  const [currentSection, setCurrentSection] =
    useState<CommunitySettingsSection>(section)
  const [accent, setAccent] = useState("#7950f2")
  const simulatedInvitation = useCommunityStoryInvitation(props.communityId ?? "photo-club", invitationMode === "preview")

  return (
    <CommunitySettings
      {...props}
      section={currentSection}
      invitationMode={invitationMode}
      invitation={suppliedInvitation ?? simulatedInvitation}
      preferencesContent={preferencesContent ?? <CommunityPreferencesContent accent={accent} setAccent={setAccent} />}
      onSectionChange={(next) => setCurrentSection(next)}
    />
  )
}

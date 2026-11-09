"use client"

import { useState, type ComponentProps } from "react"
import { CommunitySettings } from "./CommunitySettings"
import type { CommunitySettingsSection } from "./communitySettingsSections"

/**
 * Storybook-only adapter: keeps section changes inside Canvas.
 * Production route navigation is supplied independently by CommunitySettingsRoute.
 */
export function CommunitySettingsStoryNavigation({
  section = "general",
  onSectionChange: _onSectionChange,
  ...props
}: ComponentProps<typeof CommunitySettings>) {
  const [currentSection, setCurrentSection] =
    useState<CommunitySettingsSection>(section)

  return (
    <CommunitySettings
      {...props}
      section={currentSection}
      onSectionChange={(next) => setCurrentSection(next)}
    />
  )
}

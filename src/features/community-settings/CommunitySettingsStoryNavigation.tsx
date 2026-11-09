"use client"

import { useState, type ComponentProps } from "react"
import { CommunitySettings } from "./CommunitySettings"
import { CommunityPreferencesContent } from "./preferences/CommunityPreferencesContent"
import type { CommunitySettingsSection } from "./communitySettingsSections"

/**
 * Storybook-only adapter: keeps section changes inside Canvas.
 * Production route navigation is supplied independently by CommunitySettingsRoute.
 */
export function CommunitySettingsStoryNavigation({
  section = "general",
  onSectionChange: _onSectionChange,
  preferencesContent,
  ...props
}: ComponentProps<typeof CommunitySettings>) {
  const [currentSection, setCurrentSection] =
    useState<CommunitySettingsSection>(section)
  const [accent, setAccent] = useState("#7950f2")

  return (
    <CommunitySettings
      {...props}
      section={currentSection}
      preferencesContent={preferencesContent ?? <CommunityPreferencesContent accent={accent} setAccent={setAccent} />}
      onSectionChange={(next) => setCurrentSection(next)}
    />
  )
}

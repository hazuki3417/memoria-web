"use client"

import { useState } from "react"
import type { CommunitySettingsSection } from "./communitySettingsSections"

/**
 * Production navigation is URL-controlled; a Story/Prototype without onNavigate
 * retains its own local section. Keep that local state mounted in CommunitySettings.
 */
export function useCommunitySettingsSectionNavigation({
  section,
  onNavigate,
}: {
  section: CommunitySettingsSection
  onNavigate?: (href: string) => void
}) {
  const [previewSection, setPreviewSection] =
    useState<CommunitySettingsSection>(section)
  const currentSection = onNavigate ? section : previewSection

  const onSectionChange = (next: CommunitySettingsSection, href: string) => {
    if (onNavigate) onNavigate(href)
    else setPreviewSection(next)
  }

  return { currentSection, onSectionChange }
}

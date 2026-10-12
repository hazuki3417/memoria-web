"use client"

import { useRouter } from "next/navigation"
import {
  CommunitySettings,
  type CommunitySettingsSection,
} from "./CommunitySettings"

export function CommunitySettingsRoute({
  communityId,
  section = "general",
}: {
  communityId: string
  section?: CommunitySettingsSection
}) {
  const router = useRouter()
  return (
    <CommunitySettings
      communityId={communityId}
      section={section}
      onNavigate={(href) => router.push(href)}
    />
  )
}

"use client"

import { useState, type ReactNode } from "react"
import type { CommunityMember } from "../members/CommunityMembersContent"
import { CommunitySettingsView } from "./CommunitySettingsView"
import { useCommunityNameSettings } from "../general/useCommunityNameSettings"
import { useCommunityInvitation } from "../general/useCommunityInvitation"
import type { CommunitySettingsSection } from "./communitySettingsSections"
import { useCommunitySettingsSectionNavigation } from "./useCommunitySettingsSectionNavigation"

export type { CommunitySettingsSection } from "./communitySettingsSections"
type Role = "admin" | "member"

export function CommunitySettings({
  role = "admin",
  communityId = "photo-club",
  section = "general",
  onNavigate,
  communityName,
  onSaveName,
  onInspectName,
  members,
  onChangeMemberRole,
  onRemoveMember,
  onLeaveCommunity,
  onLeaveSuccess,
  usageContent,
  preferencesContent,
  contentOverride,
  communityAccentColor,
  invitationMode,
}: {
  role?: Role
  communityId?: string
  section?: CommunitySettingsSection
  onNavigate?: (href: string) => void
  communityName?: string
  onSaveName?: (name: string) => Promise<string>
  onInspectName?: () => Promise<string>
  members?: CommunityMember[]
  onChangeMemberRole?: (userId: string, role: Role) => Promise<boolean>
  onRemoveMember?: (userId: string) => Promise<boolean>
  onLeaveCommunity?: () => Promise<void>
  onLeaveSuccess?: () => void
  fileSizeUnit?: "DECIMAL" | "BINARY"
  usageContent?: ReactNode
  preferencesContent?: ReactNode
  contentOverride?: ReactNode
  communityAccentColor?: string
  invitationMode?: "preview" | "unavailable"
}) {
  const { currentSection, onSectionChange } =
    useCommunitySettingsSectionNavigation({ section, onNavigate })
  const isAdmin = role === "admin"
  const [accent, setAccent] = useState("#7950f2")
  const name = useCommunityNameSettings({ communityName, onSaveName, onInspectName })
  // URL-controlled consumers must not silently opt into the Preview simulation.
  const previewInvitation = invitationMode === "preview" || (invitationMode === undefined && !onNavigate)
  const invitation = useCommunityInvitation(communityId, previewInvitation)

  return (
    <CommunitySettingsView
      section={currentSection}
      communityId={communityId}
      isAdmin={isAdmin}
      name={name}
      invitation={invitation}
      invitationAvailable={previewInvitation}
      members={members}
      onChangeMemberRole={onChangeMemberRole}
      onRemoveMember={onRemoveMember}
      onLeaveCommunity={onLeaveCommunity}
      onLeaveSuccess={onLeaveSuccess}
      preferencesContent={preferencesContent}
      usageContent={usageContent}
      accent={accent}
      setAccent={setAccent}
      contentOverride={contentOverride}
      accentColor={communityAccentColor}
      onSectionChange={onSectionChange}
    />
  )
}

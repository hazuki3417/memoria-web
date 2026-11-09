"use client"

import { useState, type ReactNode } from "react"
import type { CommunityMember } from "./members/CommunityMembersContent"
import { CommunitySettingsView } from "./CommunitySettingsView"
import { useCommunityNameSettings } from "./general/useCommunityNameSettings"
import { useCommunityInvitation } from "./general/useCommunityInvitation"
import type { CommunitySettingsSection } from "./communitySettingsSections"

export type { CommunitySettingsSection } from "./communitySettingsSections"
type Role = "admin" | "member"

export function CommunitySettings({
  role = "admin",
  communityId = "photo-club",
  section = "general",
  onSectionChange,
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
  onSectionChange: (section: CommunitySettingsSection, href: string) => void
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
  const isAdmin = role === "admin"
  const [accent, setAccent] = useState("#7950f2")
  const name = useCommunityNameSettings({ communityName, onSaveName, onInspectName })
  // Preview behavior is explicit; navigation strategy is supplied by the consumer.
  const previewInvitation = invitationMode === "preview"
  const invitation = useCommunityInvitation(communityId, previewInvitation)

  return (
    <CommunitySettingsView
      section={section}
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

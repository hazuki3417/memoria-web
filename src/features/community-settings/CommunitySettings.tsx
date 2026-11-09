"use client"

import type { ReactNode } from "react"
import type { CommunityMember } from "./members/CommunityMembersContent"
import { CommunitySettingsView } from "./CommunitySettingsView"
import { useCommunityNameSettings } from "./useCommunityNameSettings"
import type { CommunityInvitationSectionProps } from "./general/CommunityInvitationSection"
import type { CommunitySettingsSection } from "./communitySettingsSections"

export type { CommunitySettingsSection } from "./communitySettingsSections"
type Role = "admin" | "member"
type InvitationModel = Omit<CommunityInvitationSectionProps, "isAdmin" | "available">

// The production Invitation API is not connected; no Preview action is available by default.
const unavailableInvitation: InvitationModel = {
  active: false,
  invitation: "none",
  invitationUrl: "",
  expiresAt: "",
  busy: false,
  issue: () => undefined,
  copyInvitation: async () => undefined,
  confirm: null,
  setConfirm: () => undefined,
  changeInvitation: () => undefined,
}

export type CommunitySettingsProps = {
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
  invitation?: InvitationModel
}

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
  invitation,
}: CommunitySettingsProps) {
  const isAdmin = role === "admin"
  // Keep the Form mounted across section changes so edited and unknown-outcome drafts survive Navigation.
  const name = useCommunityNameSettings({ communityName, onSaveName, onInspectName })
  // The consumer owns Invitation state; production never runs the Storybook simulation.
  const invitationAvailable = invitationMode === "preview" && invitation !== undefined

  return (
    <CommunitySettingsView
      section={section}
      communityId={communityId}
      isAdmin={isAdmin}
      name={name}
      invitation={invitation ?? unavailableInvitation}
      invitationAvailable={invitationAvailable}
      members={members}
      onChangeMemberRole={onChangeMemberRole}
      onRemoveMember={onRemoveMember}
      onLeaveCommunity={onLeaveCommunity}
      onLeaveSuccess={onLeaveSuccess}
      preferencesContent={preferencesContent}
      usageContent={usageContent}
      contentOverride={contentOverride}
      accentColor={communityAccentColor}
      onSectionChange={onSectionChange}
    />
  )
}

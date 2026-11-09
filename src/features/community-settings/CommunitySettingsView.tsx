"use client"

import type { ReactNode } from "react"
import type { CommunityMember } from "./members"
import { CommunitySettingsLayout } from "./CommunitySettingsLayout"
import { CommunityGeneral } from "./general/CommunityGeneral"
import { CommunityMembers } from "./members"
import type { CommunityInvitationSectionProps } from "./general/CommunityInvitationSection"
import type { CommunitySettingsSection } from "./communitySettingsSections"

type Role = "admin" | "member"
type InvitationModel = Omit<CommunityInvitationSectionProps, "isAdmin" | "available">

// Production Invitation API is not connected; Preview actions are never enabled by default.
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

export type CommunitySettingsViewProps = {
  role?: Role
  communityId?: string
  section?: CommunitySettingsSection
  onSectionChange: (section: CommunitySettingsSection) => void
  communityName?: string
  onSaveName?: (name: string) => Promise<string>
  onInspectName?: () => Promise<string>
  members?: CommunityMember[]
  onChangeMemberRole?: (userId: string, role: Role) => Promise<boolean>
  onRemoveMember?: (userId: string) => Promise<boolean>
  onLeaveCommunity?: () => Promise<void>
  onLeaveSuccess?: () => void
  usageContent?: ReactNode
  preferencesContent?: ReactNode
  contentOverride?: ReactNode
  communityAccentColor?: string
  invitationMode?: "preview" | "unavailable"
  invitation?: InvitationModel
}

/** Composes settings layout and section content without owning Form, Preview or Route state. */
export function CommunitySettingsView({
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
}: CommunitySettingsViewProps) {
  const isAdmin = role === "admin"
  const invitationAvailable = invitationMode === "preview" && invitation !== undefined

  let content: ReactNode

  switch (section) {
    case "general":
      content = (
        <CommunityGeneral
          name={{ communityName, onSaveName, onInspectName }}
          invitation={invitation ?? unavailableInvitation}
          invitationAvailable={invitationAvailable}
          communityId={communityId}
          isAdmin={isAdmin}
        />
      )
      break
    case "members":
      content = (
        <CommunityMembers
          members={members}
          onChangeRole={onChangeMemberRole}
          onRemoveMember={onRemoveMember}
          onLeave={onLeaveCommunity}
          onLeaveSuccess={onLeaveSuccess}
        />
      )
      break
    case "usage":
      content = <>{usageContent}</>
      break
    case "preferences":
      content = <>{preferencesContent}</>
      break
  }

  return (
    <CommunitySettingsLayout
      communityId={communityId}
      section={section}
      accentColor={communityAccentColor}
      onSectionChange={onSectionChange}
    >
      {contentOverride ?? content}
    </CommunitySettingsLayout>
  )
}

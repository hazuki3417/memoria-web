"use client"

import type { ReactNode } from "react"
import { CommunityGeneral } from "../general/CommunityGeneral"
import {
  CommunityMembers,
  type CommunityMember,
} from "../members"
import type { CommunitySettingsSection } from "../communitySettingsSections"
import type { CommunityNameSectionProps } from "../general/CommunityNameSection"
import type { CommunityInvitationSectionProps } from "../general/CommunityInvitationSection"

type Role = "admin" | "member"

export type CommunitySettingsContentProps = {
  section: CommunitySettingsSection
  communityId: string
  isAdmin: boolean
  name: Omit<CommunityNameSectionProps, "isAdmin">
  invitation: Omit<CommunityInvitationSectionProps, "isAdmin" | "available">
  invitationAvailable: boolean
  members?: CommunityMember[]
  onChangeMemberRole?: (userId: string, role: Role) => Promise<boolean>
  onRemoveMember?: (userId: string) => Promise<boolean>
  onLeaveCommunity?: () => Promise<void>
  onLeaveSuccess?: () => void
  preferencesContent?: ReactNode
  usageContent?: ReactNode
}

export function CommunitySettingsContent({
  section,
  communityId,
  isAdmin,
  name,
  invitation,
  invitationAvailable,
  members,
  onChangeMemberRole,
  onRemoveMember,
  onLeaveCommunity,
  onLeaveSuccess,
  preferencesContent,
  usageContent,
}: CommunitySettingsContentProps) {
  switch (section) {
    case "general":
      return (
        <CommunityGeneral
          name={name}
          invitation={invitation}
          invitationAvailable={invitationAvailable}
          communityId={communityId}
          isAdmin={isAdmin}
        />
      )
    case "members":
      return (
        <CommunityMembers
          members={members}
          onChangeRole={onChangeMemberRole}
          onRemoveMember={onRemoveMember}
          onLeave={onLeaveCommunity}
          onLeaveSuccess={onLeaveSuccess}
        />
      )
    case "usage":
      return <>{usageContent}</>
    case "preferences":
      return <>{preferencesContent}</>
  }
}

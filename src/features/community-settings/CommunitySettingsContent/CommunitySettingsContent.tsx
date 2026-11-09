"use client"

import type { ReactNode } from "react"
import { CommunityGeneralContent } from "../general/CommunityGeneralContent"
import {
  CommunityMembersContent,
  type CommunityMember,
} from "../members/CommunityMembersContent"
import type { CommunitySettingsSection } from "../communitySettingsSections"
import type { useCommunityNameSettings } from "../general/useCommunityNameSettings"
import type { CommunityInvitationSectionProps } from "../general/CommunityInvitationSection"

type Role = "admin" | "member"

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
}: {
  section: CommunitySettingsSection
  communityId: string
  isAdmin: boolean
  name: ReturnType<typeof useCommunityNameSettings>
  invitation: Omit<CommunityInvitationSectionProps, "isAdmin" | "available">
  invitationAvailable: boolean
  members?: CommunityMember[]
  onChangeMemberRole?: (userId: string, role: Role) => Promise<boolean>
  onRemoveMember?: (userId: string) => Promise<boolean>
  onLeaveCommunity?: () => Promise<void>
  onLeaveSuccess?: () => void
  preferencesContent?: ReactNode
  usageContent?: ReactNode
}) {
  switch (section) {
    case "general":
      return (
        <CommunityGeneralContent
          name={name}
          invitation={invitation}
          invitationAvailable={invitationAvailable}
          communityId={communityId}
          isAdmin={isAdmin}
        />
      )
    case "members":
      return (
        <CommunityMembersContent
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

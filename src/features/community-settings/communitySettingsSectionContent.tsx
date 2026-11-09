import type { ReactNode } from "react"
import type { CommunityMember } from "./members"
import { CommunityGeneral } from "./general/CommunityGeneral"
import { CommunityMembers } from "./members"
import type { CommunityInvitationSectionProps } from "./general/CommunityInvitationSection"
import type { CommunitySettingsSection } from "./communitySettingsSections"

type Role = "admin" | "member"
export type InvitationModel = Omit<CommunityInvitationSectionProps, "isAdmin" | "available">

// Production Invitation API is not connected; Preview actions are never enabled by default.
export const unavailableInvitation: InvitationModel = {
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

export type CommunitySettingsSectionProps = {
  role?: Role
  communityId?: string
  section?: CommunitySettingsSection
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
  invitationMode?: "preview" | "unavailable"
  invitation?: InvitationModel
}

/** Pure section JSX composition shared by Production Route and Storybook fixtures. */
export function renderCommunitySettingsSection({
  role = "admin",
  communityId = "photo-club",
  section = "general",
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
  invitationMode,
  invitation,
}: CommunitySettingsSectionProps): ReactNode {
  const isAdmin = role === "admin"
  const invitationAvailable = invitationMode === "preview" && invitation !== undefined
  switch (section) {
    case "general":
      return (
        <CommunityGeneral
          name={{ communityName, onSaveName, onInspectName }}
          invitation={invitation ?? unavailableInvitation}
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

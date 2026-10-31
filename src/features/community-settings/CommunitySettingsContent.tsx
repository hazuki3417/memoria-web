"use client"

import type { ReactNode } from "react"
import { CommunityGeneralContent } from "./CommunityGeneralContent"
import { CommunityMembersContent, type CommunityMember } from "./CommunityMembersContent"
import { CommunityPreferencesContent } from "./CommunityPreferencesContent"
import type { CommunitySettingsSection } from "./communitySettingsSections"
import type { useCommunityNameSettings } from "./useCommunityNameSettings"
import type { useCommunityInvitation } from "./useCommunityInvitation"

type Role = "admin" | "member"

export function CommunitySettingsContent({
  section,
  communityId,
  isAdmin,
  name,
  invitation,
  members,
  onChangeMemberRole,
  onRemoveMember,
  onLeaveCommunity,
  onLeaveSuccess,
  preferencesContent,
  usageContent,
  accent,
  setAccent,
}: {
  section: CommunitySettingsSection
  communityId: string
  isAdmin: boolean
  name: ReturnType<typeof useCommunityNameSettings>
  invitation: ReturnType<typeof useCommunityInvitation>
  members?: CommunityMember[]
  onChangeMemberRole?: (userId: string, role: Role) => Promise<boolean>
  onRemoveMember?: (userId: string) => Promise<boolean>
  onLeaveCommunity?: () => Promise<void>
  onLeaveSuccess?: () => void
  preferencesContent?: ReactNode
  usageContent?: ReactNode
  accent: string
  setAccent: (value: string) => void
}) {
  switch (section) {
    case "general":
      return (
        <CommunityGeneralContent
          name={name}
          invitation={invitation}
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
      return (
        <>
          {preferencesContent ?? (
            <CommunityPreferencesContent accent={accent} setAccent={setAccent} />
          )}
        </>
      )
  }
}

"use client"

import { Stack } from "@mantine/core"
import { PageHeader } from "@/components/PageHeader"
import type { CommunityMember } from "@/features/community/CommunityProvider"
import { CommunityMemberRemovalDialog } from "./CommunityMemberRemovalDialog"
import { CommunityMemberRoleDialog } from "./CommunityMemberRoleDialog"
import { CommunityLeaveDialog } from "./CommunityLeaveDialog"
import { CommunityMembersTableSection } from "./CommunityMembersTableSection"
import { CommunityLeaveSection } from "./CommunityLeaveSection"
import {
  useCommunityMembersState,
  type CommunityMembersActions,
} from "./useCommunityMembersState"

export type { CommunityMember } from "@/features/community/CommunityProvider"
export { COMMUNITY_MEMBER_LIMIT, COMMUNITY_ADMIN_LIMIT } from "./communityMemberLimits"

const previewMembers: CommunityMember[] = [
  { id: "self", name: "ユーザー", role: "admin", isSelf: true },
  { id: "m1", name: "山田 花子", role: "admin" },
  { id: "m2", name: "佐藤 葵", role: "member" },
  { id: "m3", name: "鈴木 太郎", role: "member" },
]

// The API defines the default order: self first, then nickname ascending.
export function CommunityMembersContent({
  members = previewMembers,
  onLeave,
  onLeaveSuccess,
  onChangeRole,
  onRemoveMember,
}: { members?: CommunityMember[] } & CommunityMembersActions) {
  const state = useCommunityMembersState({
    members, onLeave, onLeaveSuccess, onChangeRole, onRemoveMember,
  })
  return (
    <Stack gap="xl">
      <PageHeader
        title="メンバー"
        description="Communityの参加者と役割を確認します。"
      />
      <CommunityMembersTableSection
        members={members}
        state={state}
        onChangeRole={onChangeRole}
        onRemoveMember={onRemoveMember}
      />
      <CommunityLeaveSection state={state} onLeave={onLeave} />
      <CommunityMemberRemovalDialog state={state} />
      <CommunityMemberRoleDialog state={state} onChangeRole={onChangeRole} />
      <CommunityLeaveDialog state={state} onLeave={onLeave} />
    </Stack>
  )
}

"use client"

import { Stack } from "@mantine/core"
import { PageHeader } from "@/components/PageHeader"
import type { CommunityMember } from "@/features/community/CommunityProvider"
import { CommunityMemberRemovalModal } from "./CommunityMemberRemovalModal"
import { CommunityMemberRoleModal } from "./CommunityMemberRoleModal"
import { CommunityLeaveModal } from "./CommunityLeaveModal"
import { CommunityMembersTableSection } from "./CommunityMembersTableSection"
import { CommunityLeaveSection } from "./CommunityLeaveSection"
import {
  useCommunityMembersState,
  type CommunityMembersActions,
} from "./useCommunityMembersState"

// The API defines the default order: self first, then nickname ascending.
export const CommunityMembersView = ({
  members,
  onLeave,
  onLeaveSuccess,
  onChangeRole,
  onRemoveMember,
}: { members: CommunityMember[] } & CommunityMembersActions) => {
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
      <CommunityMemberRemovalModal state={state} />
      <CommunityMemberRoleModal state={state} onChangeRole={onChangeRole} />
      <CommunityLeaveModal state={state} onLeave={onLeave} />
    </Stack>
  )
}

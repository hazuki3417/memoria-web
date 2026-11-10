"use client"

import { CommunityMembers, type CommunityMember } from "./index"
import { useCommunityMemberRemovalAction } from "./useCommunityMemberRemovalAction"
import { useCommunityLeaveAction } from "./useCommunityLeaveAction"
import { useCommunityRoleChangeAction } from "./useCommunityRoleChangeAction"

type ConnectedCommunityMembersProps = {
  communityId: string
  members?: CommunityMember[]
  onLeaveSuccess: () => void
}

/** Members固有のMutationだけを生成し、既存の通知・再取得・退会後Navigationを維持する。 */
export function ConnectedCommunityMembers({
  communityId,
  members,
  onLeaveSuccess,
}: ConnectedCommunityMembersProps) {
  const { onRemoveMember } = useCommunityMemberRemovalAction(communityId)
  const { onLeaveCommunity } = useCommunityLeaveAction(communityId)
  const { onChangeMemberRole } = useCommunityRoleChangeAction(communityId)

  return (
    <CommunityMembers
      members={members}
      onChangeRole={onChangeMemberRole}
      onRemoveMember={onRemoveMember}
      onLeave={onLeaveCommunity}
      onLeaveSuccess={onLeaveSuccess}
    />
  )
}

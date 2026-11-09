"use client"

import { useCommunityMemberRemovalAction } from "./useCommunityMemberRemovalAction"
import { useCommunityLeaveAction } from "./useCommunityLeaveAction"
import { useCommunityRoleChangeAction } from "./useCommunityRoleChangeAction"

/** Composes independent Community membership mutations for the route. */
export function useCommunityMembershipActions(communityId: string) {
  const { onRemoveMember } = useCommunityMemberRemovalAction(communityId)
  const { onLeaveCommunity } = useCommunityLeaveAction(communityId)
  const { onChangeMemberRole } = useCommunityRoleChangeAction(communityId)

  return { onRemoveMember, onLeaveCommunity, onChangeMemberRole }
}

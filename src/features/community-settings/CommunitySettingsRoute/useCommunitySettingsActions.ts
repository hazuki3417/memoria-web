"use client"

import { useCommunityNameAction } from "../general/useCommunityNameAction"
import { useCommunityMemberRemovalAction } from "../members/useCommunityMemberRemovalAction"
import { useCommunityLeaveAction } from "../members/useCommunityLeaveAction"
import { useCommunityRoleChangeAction } from "../members/useCommunityRoleChangeAction"

/** Composes independent settings mutations without changing the route contract. */
export function useCommunitySettingsActions(communityId: string) {
  const { onSaveName } = useCommunityNameAction(communityId)
  const { onRemoveMember } = useCommunityMemberRemovalAction(communityId)
  const { onLeaveCommunity } = useCommunityLeaveAction(communityId)
  const { onChangeMemberRole } = useCommunityRoleChangeAction(communityId)
  return { onRemoveMember, onLeaveCommunity, onChangeMemberRole, onSaveName }
}

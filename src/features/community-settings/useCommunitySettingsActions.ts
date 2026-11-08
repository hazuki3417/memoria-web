"use client"

import { useCommunityNameAction } from "./general/useCommunityNameAction"
import { useCommunityMembershipActions } from "./members/useCommunityMembershipActions"

/** Composes independent settings mutations without changing the route contract. */
export function useCommunitySettingsActions(communityId: string) {
  const { onSaveName } = useCommunityNameAction(communityId)
  const { onRemoveMember, onLeaveCommunity, onChangeMemberRole } =
    useCommunityMembershipActions(communityId)
  return { onRemoveMember, onLeaveCommunity, onChangeMemberRole, onSaveName }
}

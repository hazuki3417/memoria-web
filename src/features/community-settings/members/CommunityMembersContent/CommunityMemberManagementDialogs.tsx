"use client"

import type { CommunityMembersActions, useCommunityMembersState } from "./useCommunityMembersState"
import { CommunityMemberRemovalDialog } from "./CommunityMemberRemovalDialog"
import { CommunityMemberRoleDialog } from "./CommunityMemberRoleDialog"
import { CommunityLeaveDialog } from "./CommunityLeaveDialog"

type MembersState = ReturnType<typeof useCommunityMembersState>

/** Keeps the existing ordering and mount lifetime of three management dialogs. */
export function CommunityMemberManagementDialogs({
  state,
  onLeave,
  onChangeRole,
}: { state: MembersState } & CommunityMembersActions) {
  return (
    <>
      <CommunityMemberRemovalDialog state={state} />
      <CommunityMemberRoleDialog state={state} onChangeRole={onChangeRole} />
      <CommunityLeaveDialog state={state} onLeave={onLeave} />
    </>
  )
}

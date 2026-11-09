"use client"

import { useCommunityMemberTableState } from "./useCommunityMemberTableState"
import { useCommunityLeaveState } from "./useCommunityLeaveState"
import { useCommunityRoleChangeState } from "./useCommunityRoleChangeState"
import { useCommunityMemberRemovalState } from "./useCommunityMemberRemovalState"
import type { CommunityMember } from "@/features/community/CommunityProvider"

import { COMMUNITY_MEMBER_LIMIT, COMMUNITY_ADMIN_LIMIT } from "./communityMemberLimits"

export type CommunityMembersActions = {
  onLeave?: () => Promise<void>
  onLeaveSuccess?: () => void
  onChangeRole?: (userId: string, role: "admin" | "member") => Promise<boolean>
  onRemoveMember?: (userId: string) => Promise<boolean>
}

/** Composes table, capability limits, and independent management lifecycles. */
export function useCommunityMembersState({
  members,
  onLeave,
  onLeaveSuccess,
  onChangeRole,
  onRemoveMember,
}: { members: CommunityMember[] } & CommunityMembersActions) {
  const { query, setQuery, sort, setSort, rows, changeSort, ariaSort } =
    useCommunityMemberTableState(members)
  const self = members.find((member) => member.isSelf)
  const adminCount = members.filter((member) => member.role === "admin").length
  const memberLimitReached = members.length >= COMMUNITY_MEMBER_LIMIT
  const adminLimitReached = adminCount >= COMMUNITY_ADMIN_LIMIT
  const blocked = self?.role === "admin" && adminCount <= 1

  const { opened, setOpened, busy, error, done, close, leave } =
    useCommunityLeaveState({ onLeave, onLeaveSuccess, blocked })
  const {
    roleTarget, setRoleTarget, selectedRole, setSelectedRole,
    roleBusy, roleError, setRoleError, confirmRoleChange,
  } = useCommunityRoleChangeState({
    onChangeRole, adminCount, adminLimitReached,
  })
  const {
    removeTarget, setRemoveTarget, removeBusy, removeError, setRemoveError,
    confirmRemoval,
  } = useCommunityMemberRemovalState({ onRemoveMember })

  return {
    query, setQuery, sort, setSort, opened, setOpened, busy, error, done,
    roleTarget, setRoleTarget, selectedRole, setSelectedRole, roleBusy, roleError,
    setRoleError, removeTarget, setRemoveTarget, removeBusy, removeError,
    setRemoveError, self, adminCount, memberLimitReached, adminLimitReached,
    blocked, rows, changeSort, ariaSort, close, leave, confirmRoleChange, confirmRemoval,
  }
}

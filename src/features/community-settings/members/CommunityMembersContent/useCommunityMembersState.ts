"use client"

import { useState } from "react"
import { useCommunityMemberTableState } from "./useCommunityMemberTableState"
import { showNotification } from "@/components/Feedback"
import type { CommunityMember } from "@/features/community/CommunityProvider"

export const COMMUNITY_MEMBER_LIMIT = 30
export const COMMUNITY_ADMIN_LIMIT = 3


export type CommunityMembersActions = {
  onLeave?: () => Promise<void>
  onLeaveSuccess?: () => void
  onChangeRole?: (userId: string, role: "admin" | "member") => Promise<boolean>
  onRemoveMember?: (userId: string) => Promise<boolean>
}

/** Owns member search/sort, capability limits, and confirmation operations. */
export function useCommunityMembersState({
  members,
  onLeave,
  onLeaveSuccess,
  onChangeRole,
  onRemoveMember,
}: { members: CommunityMember[] } & CommunityMembersActions) {
  const { query, setQuery, sort, setSort, rows, changeSort, ariaSort } =
    useCommunityMemberTableState(members)
  const [opened, setOpened] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const [roleTarget, setRoleTarget] = useState<CommunityMember | null>(null)
  const [selectedRole, setSelectedRole] = useState<"admin" | "member">("member")
  const [roleBusy, setRoleBusy] = useState(false)
  const [roleError, setRoleError] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<CommunityMember | null>(null)
  const [removeBusy, setRemoveBusy] = useState(false)
  const [removeError, setRemoveError] = useState(false)
  const self = members.find((member) => member.isSelf)
  const adminCount = members.filter((member) => member.role === "admin").length
  const memberLimitReached = members.length >= COMMUNITY_MEMBER_LIMIT
  const adminLimitReached = adminCount >= COMMUNITY_ADMIN_LIMIT
  const blocked = self?.role === "admin" && adminCount <= 1
  const close = () => {
    if (!busy) {
      setOpened(false)
      setError("")
    }
  }
  const leave = async () => {
    if (!onLeave || blocked || busy) return
    setBusy(true)
    setError("")
    try {
      await onLeave()
      setDone(true)
      setOpened(false)
      showNotification({
        kind: "success",
        title: "Communityを退会",
        description: "Communityから退会しました。",
      })
      onLeaveSuccess?.()
    } catch {
      setError(
        "退会処理に失敗しました。現在の参加状況を確認して再試行してください。",
      )
    } finally {
      setBusy(false)
    }
  }
  const confirmRoleChange = async () => {
    if (
      !roleTarget ||
      !onChangeRole ||
      roleBusy ||
      roleError ||
      selectedRole === roleTarget.role ||
      (selectedRole === "admin" && adminLimitReached) ||
      (selectedRole === "member" &&
        roleTarget.role === "admin" &&
        adminCount <= 1)
    )
      return
    setRoleBusy(true)
    try {
      if (await onChangeRole(roleTarget.id, selectedRole)) setRoleTarget(null)
      else setRoleError(true)
    } catch {
      setRoleError(true)
    } finally {
      setRoleBusy(false)
    }
  }
  const confirmRemoval = async () => {
    if (!removeTarget || !onRemoveMember || removeBusy || removeError) return
    setRemoveBusy(true)
    try {
      if (await onRemoveMember(removeTarget.id)) setRemoveTarget(null)
      else setRemoveError(true)
    } catch {
      setRemoveError(true)
    } finally {
      setRemoveBusy(false)
    }
  }

  return {
    query, setQuery, sort, setSort, opened, setOpened, busy, error, done,
    roleTarget, setRoleTarget, selectedRole, setSelectedRole, roleBusy, roleError,
    setRoleError, removeTarget, setRemoveTarget, removeBusy, removeError,
    setRemoveError, self, adminCount, memberLimitReached, adminLimitReached,
    blocked, rows, changeSort, ariaSort, close, leave, confirmRoleChange, confirmRemoval,
  }
}

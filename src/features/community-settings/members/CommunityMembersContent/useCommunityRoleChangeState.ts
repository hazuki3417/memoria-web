"use client"

import { useState } from "react"
import type { CommunityMember } from "@/features/community/CommunityProvider"

/** Owns member role-change confirmation and result-unknown guard. */
export function useCommunityRoleChangeState({
  onChangeRole,
  adminCount,
  adminLimitReached,
}: {
  onChangeRole?: (userId: string, role: "admin" | "member") => Promise<boolean>
  adminCount: number
  adminLimitReached: boolean
}) {
  const [roleTarget, setRoleTarget] = useState<CommunityMember | null>(null)
  const [selectedRole, setSelectedRole] = useState<"admin" | "member">("member")
  const [roleBusy, setRoleBusy] = useState(false)
  const [roleError, setRoleError] = useState(false)
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

  return {
    roleTarget, setRoleTarget, selectedRole, setSelectedRole,
    roleBusy, roleError, setRoleError, confirmRoleChange,
  }
}

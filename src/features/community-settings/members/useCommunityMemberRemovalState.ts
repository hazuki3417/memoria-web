"use client"

import { useState } from "react"
import type { CommunityMember } from "@/features/community/CommunityProvider"

/** Owns member-removal confirmation and result-unknown guard. */
export function useCommunityMemberRemovalState({
  onRemoveMember,
}: {
  onRemoveMember?: (userId: string) => Promise<boolean>
}) {
  const [removeTarget, setRemoveTarget] = useState<CommunityMember | null>(null)
  const [removeBusy, setRemoveBusy] = useState(false)
  const [removeError, setRemoveError] = useState(false)
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
    removeTarget, setRemoveTarget, removeBusy, removeError, setRemoveError,
    confirmRemoval,
  }
}

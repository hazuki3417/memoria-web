"use client"

import { showNotification } from "@/components/Feedback"
import { CommunityMembersDocument, useRemoveCommunityMemberMutation } from "@/infrastructure/graphql/generated"

/** Owns the member-removal mutation and existing refresh/feedback semantics. */
export function useCommunityMemberRemovalAction(communityId: string) {
  const [removeMember] = useRemoveCommunityMemberMutation()

  const onRemoveMember = async (userId: string): Promise<boolean> => {
    try {
      const result = await removeMember({
        variables: { input: { communityId, userId } },
        refetchQueries: [CommunityMembersDocument],
        awaitRefetchQueries: true,
      })
      if (!result.data?.removeCommunityMember.success) {
        return false
      }
      showNotification({
        kind: "success",
        title: "メンバーを除外",
        description: "メンバーを除外しました。",
      })
      return true
    } catch {
      return false
    }
  }

  return { onRemoveMember }
}

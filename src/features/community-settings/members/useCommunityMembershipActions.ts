"use client"

import { showNotification } from "@/components/Feedback"
import {
  MyCommunitiesDocument,
  CommunityMembersDocument,
  CommunityMemberRole,
  useChangeCommunityMemberRoleMutation,
  useRemoveCommunityMemberMutation,
  useLeaveCommunityMutation,
} from "@/infrastructure/graphql/generated"

/** Owns membership mutations and their existing success/failure feedback. */
export function useCommunityMembershipActions(communityId: string) {
  const [changeRole] = useChangeCommunityMemberRoleMutation()
  const [removeMember] = useRemoveCommunityMemberMutation()
  const [leaveCommunity] = useLeaveCommunityMutation()

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

  const onLeaveCommunity = async (): Promise<void> => {
    const result = await leaveCommunity({
      variables: { communityId },
      refetchQueries: [MyCommunitiesDocument],
      awaitRefetchQueries: true,
    })
    if (!result.data?.leaveCommunity.success) throw new Error("leave failed")
  }

  const onChangeMemberRole = async (
    userId: string,
    role: "admin" | "member",
  ): Promise<boolean> => {
    try {
      const result = await changeRole({
        variables: {
          input: {
            communityId,
            userId,
            role:
              role === "admin"
                ? CommunityMemberRole.Admin
                : CommunityMemberRole.Member,
          },
        },
        refetchQueries: [CommunityMembersDocument],
        awaitRefetchQueries: true,
      })
      if (!result.data?.changeCommunityMemberRole.success) {
        return false
      }
      showNotification({
        kind: "success",
        title: "メンバーの役割を変更",
        description: "メンバーの役割を変更しました。",
      })
      return true
    } catch {
      return false
    }
  }

  return { onRemoveMember, onLeaveCommunity, onChangeMemberRole }
}

"use client"

import { showNotification } from "@/components/Feedback"
import { CommunityMembersDocument, CommunityMemberRole, useChangeCommunityMemberRoleMutation } from "@/infrastructure/graphql/generated"

/** Owns role mutation and its existing cache refresh/feedback semantics. */
export function useCommunityRoleChangeAction(communityId: string) {
  const [changeRole] = useChangeCommunityMemberRoleMutation()

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

  return { onChangeMemberRole }
}

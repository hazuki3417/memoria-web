"use client"

import { showNotification } from "@/components/Feedback"
import {
  MyCommunitiesDocument,
  CommunityMembersDocument,
  CommunityMemberRole,
  useRenameCommunityMutation,
  useChangeCommunityMemberRoleMutation,
  useRemoveCommunityMemberMutation,
  useLeaveCommunityMutation,
} from "@/infrastructure/graphql/generated"

export function useCommunitySettingsActions(communityId: string) {
  const [renameCommunity] = useRenameCommunityMutation()
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
        showNotification({
          kind: "error",
          title: "メンバーを除外",
          description: "メンバーを除外できませんでした。",
        })
        return false
      }
      showNotification({
        kind: "success",
        title: "メンバーを除外",
        description: "メンバーを除外しました。",
      })
      return true
    } catch {
      showNotification({
        kind: "error",
        title: "メンバーを除外",
        description: "メンバーを除外できませんでした。",
      })
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
        showNotification({
          kind: "error",
          title: "メンバーの役割を変更",
          description: "メンバーの役割を変更できませんでした。",
        })
        return false
      }
      showNotification({
        kind: "success",
        title: "メンバーの役割を変更",
        description: "メンバーの役割を変更しました。",
      })
      return true
    } catch {
      showNotification({
        kind: "error",
        title: "メンバーの役割を変更",
        description: "メンバーの役割を変更できませんでした。",
      })
      return false
    }
  }

  const onSaveName = async (nextName: string): Promise<boolean> => {
    try {
      const result = await renameCommunity({
        variables: { input: { communityId, name: nextName } },
        refetchQueries: [MyCommunitiesDocument],
        awaitRefetchQueries: true,
      })
      if (result.data?.renameCommunity.community) return true
      showNotification({
        kind: "error",
        title: "Community名を変更",
        description: "Community名を変更できませんでした。",
      })
      return false
    } catch {
      showNotification({
        kind: "error",
        title: "Community名を変更",
        description: "Community名を変更できませんでした。",
      })
      return false
    }
  }

  return { onRemoveMember, onLeaveCommunity, onChangeMemberRole, onSaveName }
}

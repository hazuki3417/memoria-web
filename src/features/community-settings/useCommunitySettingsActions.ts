"use client"

import { showNotification } from "@/components/Feedback"
import { SettingsInputValidationError, requireSettingsMutationOutcome } from "@/infrastructure/graphql/settingsMutationResult"
import {
  MyCommunitiesDocument,
  CommunityMembersDocument,
  CommunityMemberRole,
  useUpdateCommunityMutation,
  useChangeCommunityMemberRoleMutation,
  useRemoveCommunityMemberMutation,
  useLeaveCommunityMutation,
} from "@/infrastructure/graphql/generated"

export function useCommunitySettingsActions(communityId: string) {
  const [updateCommunity] = useUpdateCommunityMutation()
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

  const onSaveName = async (nextName: string): Promise<string> => {
    const result = await updateCommunity({
      variables: { input: { communityId, name: nextName } },
      errorPolicy: "all",
      // The confirmed mutation must not be rejected by a later refresh failure.
      refetchQueries: [MyCommunitiesDocument],
      awaitRefetchQueries: false,
    })
    const outcome = requireSettingsMutationOutcome(result.data?.updateCommunity, result)
    if (outcome?.__typename === "InputValidationFailure")
      throw new SettingsInputValidationError(outcome.violations)
    if (outcome?.__typename !== "UpdateCommunitySuccess")
      throw new Error("Community name save unconfirmed")
    return outcome.community.name
  }

  return { onRemoveMember, onLeaveCommunity, onChangeMemberRole, onSaveName }
}

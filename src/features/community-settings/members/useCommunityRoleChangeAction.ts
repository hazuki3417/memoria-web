"use client"

import { useApolloClient } from "@apollo/client"
import { showNotification } from "@/components/Feedback"
import { CommunityMembersDocument, CommunitySettingsMembersDocument, CommunityMemberRole, useChangeCommunityMemberRoleMutation } from "@/infrastructure/graphql/generated"

/** Mutation確定と後続の一覧再取得を区別する。 */
export function useCommunityRoleChangeAction(communityId: string) {
  const client = useApolloClient()
  const [changeRole] = useChangeCommunityMemberRoleMutation()

  const onChangeMemberRole = async (
    userId: string,
    role: "admin" | "member",
  ): Promise<boolean> => {
    const confirmed = await changeRole({
      variables: {
        input: {
          communityId,
          userId,
          role: role === "admin" ? CommunityMemberRole.Admin : CommunityMemberRole.Member,
        },
      },
    }).then(
      (result) => result.data?.changeCommunityMemberRole.success === true,
      () => false,
    )
    if (!confirmed) return false

    let synced = false
    try {
      const refreshed = await client.refetchQueries({
        include: [CommunityMembersDocument, CommunitySettingsMembersDocument],
      })
      synced = refreshed.every((query) => !query.error && !query.errors?.length)
    } catch {
      // Mutationで確定済みの変更は自動再送しない。
    }
    try {
      showNotification(synced
        ? { kind: "success", title: "メンバーの役割を変更", description: "メンバーの役割を変更しました。" }
        : {
            kind: "warning",
            title: "役割を変更しましたが表示を更新できませんでした",
            description: "役割変更は完了しています。ページを再読み込みして最新の役割を確認してください。操作を再送しないでください。",
          })
    } catch {
      // 通知例外が確定済みの役割変更を失敗へ格下げしない。
    }
    return true
  }

  return { onChangeMemberRole }
}

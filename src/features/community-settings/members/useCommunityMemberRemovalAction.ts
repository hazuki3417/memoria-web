"use client"

import { useApolloClient } from "@apollo/client"
import { showNotification } from "@/components/Feedback"
import { CommunityMembersDocument, CommunitySettingsMembersDocument, useRemoveCommunityMemberMutation } from "@/infrastructure/graphql/generated"

/** Mutation確定と後続の一覧再取得を区別する。 */
export function useCommunityMemberRemovalAction(communityId: string) {
  const client = useApolloClient()
  const [removeMember] = useRemoveCommunityMemberMutation()

  const onRemoveMember = async (userId: string): Promise<boolean> => {
    const confirmed = await removeMember({
      variables: { input: { communityId, userId } },
    }).then(
      (result) => result.data?.removeCommunityMember.success === true,
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
      // 操作自体は成立しているため、自動再送しない。
    }
    showNotification(synced
      ? { kind: "success", title: "メンバーを除外", description: "メンバーを除外しました。" }
      : {
          kind: "warning",
          title: "メンバーを除外しましたが表示を更新できませんでした",
          description: "除外は完了しています。ページを再読み込みして参加状態を確認してください。再度除外を送信しないでください。",
        })
    return true
  }

  return { onRemoveMember }
}

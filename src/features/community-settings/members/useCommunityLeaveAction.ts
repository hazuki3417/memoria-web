"use client"

import { useApolloClient } from "@apollo/client"
import { showNotification } from "@/components/Feedback"
import { MyCommunitiesDocument, useLeaveCommunityMutation } from "@/infrastructure/graphql/generated"

/** 退会の成立をQuery更新失敗から独立させて判断する。 */
export function useCommunityLeaveAction(communityId: string) {
  const client = useApolloClient()
  const [leaveCommunity] = useLeaveCommunityMutation()

  const onLeaveCommunity = async (): Promise<void> => {
    const result = await leaveCommunity({ variables: { communityId } })
    if (!result.data?.leaveCommunity.success) throw new Error("leave failed")

    let synced = false
    try {
      const refreshed = await client.refetchQueries({ include: [MyCommunitiesDocument] })
      synced = refreshed.every((query) => !query.error && !query.errors?.length)
    } catch {
      // 成立済み退会は再送せずDashboardへの遷移を継続する。
    }
    if (!synced) {
      try {
        showNotification({
          kind: "warning",
          title: "退会は完了しましたが情報を更新できませんでした",
          description: "退会は成立しています。Dashboardで最新のCommunity一覧を確認してください。",
        })
      } catch {
        // 通知例外で成立済み退会後のDashboard遷移を妨げない。
      }
    }
  }

  return { onLeaveCommunity }
}

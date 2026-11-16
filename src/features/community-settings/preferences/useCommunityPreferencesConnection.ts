"use client"

import { useCommunitySettingsRefreshError } from "../useCommunitySettingsRefreshError"
import { useCommunityMySettingsQuery } from "@/infrastructure/graphql/generated"

/** Community環境設定の取得・再取得と、確定済みデータの更新失敗通知を提供する。 */
export const useCommunityPreferencesConnection = (communityId: string) => {
  const { data, loading, error, refetch } = useCommunityMySettingsQuery({
    variables: { communityId },
    fetchPolicy: "network-only",
  })
  useCommunitySettingsRefreshError(Boolean(data?.community && error))
  // Hostが取得状態を描画し、再取得できるようにする。
  return { data, loading, refetch }
}

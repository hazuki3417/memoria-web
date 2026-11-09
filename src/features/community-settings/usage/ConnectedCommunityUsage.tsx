"use client"

import { SettingsContentStatus } from "@/components/SettingsContentStatus/SettingsContentStatus"
import {
  useCommunityUsageQuery,
  useCurrentUserQuery,
} from "@/infrastructure/graphql/generated"
import { Usage, emptyUsage, mapUsageProjection, type UsageData } from "@/features/usage"
import { useCommunitySettingsRefreshError } from "../useCommunitySettingsRefreshError"

/** Community Context固有のGraphQL接続。共通のUsage UIはfeatures/usageが所有する。 */
export function ConnectedCommunityUsage({ communityId }: { communityId: string }) {
  const community = useCommunityUsageQuery({
    variables: { communityId },
    skip: !communityId,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  })
  const communityPreferences = useCurrentUserQuery()
  const projection = community.data?.communityUsage

  let usage: UsageData = emptyUsage
  let conversionFailed = false
  if (projection) {
    try {
      usage = mapUsageProjection(projection)
    } catch {
      conversionFailed = true
    }
  }

  const hasData = Boolean(projection) && !conversionFailed && Boolean(communityPreferences.data?.me)
  useCommunitySettingsRefreshError(Boolean(hasData && (community.error || communityPreferences.error)))
  const status = hasData
    ? "ready"
    : community.loading || communityPreferences.loading
      ? "loading"
      : "error"

  const onRetry = () => {
    void Promise.all([
      community.refetch().catch(() => undefined),
      communityPreferences.refetch().catch(() => undefined),
    ])
  }

  return (
    <SettingsContentStatus
      state={status}
      label="利用状況を読み込み中"
      errorTitle="利用状況を取得できませんでした"
      onRetry={onRetry}
    >
      <Usage
        key={communityId}
        scope="community"
        usage={usage}
        fileSizeUnit={
          communityPreferences.data?.me?.preferences.fileSizeUnit === "BINARY"
            ? "BINARY"
            : "DECIMAL"
        }
      />
    </SettingsContentStatus>
  )
}

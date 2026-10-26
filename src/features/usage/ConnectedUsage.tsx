"use client"

import {
  useCommunityUsageQuery,
  useCurrentUserQuery,
  usePersonalUsageQuery,
} from "@/infrastructure/graphql/generated"
import { SettingsUsage } from "./SettingsUsage"
import { emptyUsage, mapUsageProjection } from "./usageGraphqlAdapter"
import type { SettingsUsageData, UsageStatus } from "./usageTypes"

export function ConnectedUsage({
  scope,
  communityId,
}: {
  scope: "personal" | "community"
  communityId?: string
}) {
  const personal = usePersonalUsageQuery({
    skip: scope !== "personal",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  })
  const community = useCommunityUsageQuery({
    variables: { communityId: communityId ?? "" },
    skip: scope !== "community" || !communityId,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  })
  const communityPreferences = useCurrentUserQuery({ skip: scope !== "community" })
  const active = scope === "personal" ? personal : community
  const projection =
    scope === "personal" ? personal.data?.me?.usage : community.data?.communityUsage

  const communityPreferencesLoading = scope === "community" && communityPreferences.loading
  const communityPreferencesError = scope === "community" &&
    (Boolean(communityPreferences.error) ||
      (!communityPreferences.loading && !communityPreferences.data?.me))

  let usage: SettingsUsageData = emptyUsage
  let conversionFailed = false
  if (projection) {
    try {
      usage = mapUsageProjection(projection)
    } catch {
      conversionFailed = true
    }
  }

  let status: UsageStatus = "ready"
  if (active.loading || communityPreferencesLoading) {
    status = "loading"
  } else if (active.error || communityPreferencesError || conversionFailed || !projection) {
    status = "error"
  }

  const retry = () => {
    // 再取得で再び失敗した場合もApolloのerror stateに反映し、Retryを維持する。
    if (active.error || !projection || conversionFailed) {
      void active.refetch().catch(() => undefined)
    }
    if (communityPreferencesError) {
      void communityPreferences.refetch().catch(() => undefined)
    }
  }

  return (
    <SettingsUsage
      scope={scope}
      usage={usage}
      status={status}
      onRetry={retry}
      fileSizeUnit={
        (scope === "personal"
          ? personal.data?.me?.preferences.fileSizeUnit
          : communityPreferences.data?.me?.preferences.fileSizeUnit) === "BINARY"
          ? "BINARY"
          : "DECIMAL"
      }
    />
  )
}

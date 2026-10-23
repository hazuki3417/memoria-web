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
  })
  const community = useCommunityUsageQuery({
    variables: { communityId: communityId ?? "" },
    skip: scope !== "community" || !communityId,
    fetchPolicy: "cache-and-network",
  })
  const preferences = useCurrentUserQuery({ skip: scope !== "personal" })
  const active = scope === "personal" ? personal : community
  const projection =
    scope === "personal" ? personal.data?.me?.usage : community.data?.communityUsage
  const preferencesLoading = scope === "personal" && preferences.loading
  const preferencesError = scope === "personal" &&
    (Boolean(preferences.error) || (!preferences.loading && !preferences.data?.me))

  let usage: SettingsUsageData = emptyUsage
  let conversionFailed = false
  if (projection) {
    try {
      usage = mapUsageProjection(projection)
    } catch {
      conversionFailed = true
    }
  }

  const status: UsageStatus =
    active.loading || preferencesLoading
      ? "loading"
      : active.error || preferencesError || conversionFailed || !projection
        ? "error"
        : "ready"

  const retry = () => {
    // 再取得で再び失敗した場合もApolloのerror stateに反映し、Retryを維持する。
    void active.refetch().catch(() => undefined)
    if (scope === "personal") {
      void preferences.refetch().catch(() => undefined)
    }
  }

  return (
    <SettingsUsage
      scope={scope}
      usage={usage}
      status={status}
      onRetry={retry}
      fileSizeUnit={
        scope === "personal" &&
        preferences.data?.me?.preferences.fileSizeUnit === "BINARY"
          ? "BINARY"
          : "DECIMAL"
      }
    />
  )
}

"use client"

import {
  useCommunityUsageQuery,
  useCurrentUserQuery,
  usePersonalUsageQuery,
} from "@/infrastructure/graphql/generated"
import { SettingsUsage } from "./SettingsUsage"
import { PageStatusBoundary } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { useSettingsRefreshError } from "@/features/settings/useSettingsRefreshError"
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
  const communityPreferences = useCurrentUserQuery({
    skip: scope !== "community",
  })
  const active = scope === "personal" ? personal : community
  const projection =
    scope === "personal"
      ? personal.data?.me?.usage
      : community.data?.communityUsage

  const communityPreferencesLoading =
    scope === "community" && communityPreferences.loading

  let usage: SettingsUsageData = emptyUsage
  let conversionFailed = false
  if (projection) {
    try {
      usage = mapUsageProjection(projection)
    } catch {
      conversionFailed = true
    }
  }

  const hasData = Boolean(projection) && !conversionFailed && Boolean(scope === "personal" || communityPreferences.data?.me)
  useSettingsRefreshError(Boolean(hasData && (active.error || communityPreferences.error)))
  const status: UsageStatus = hasData
    ? "ready"
    : active.loading || communityPreferencesLoading
      ? "loading"
      : "error"

  if (status !== "ready") {
    return (
      <PageStatusBoundary state={status} label="利用状況を読み込み中">
        {null}
      </PageStatusBoundary>
    )
  }

  return (
    <SettingsUsage
      scope={scope}
      usage={usage}
      status={status}
      fileSizeUnit={
        (scope === "personal"
          ? personal.data?.me?.preferences.fileSizeUnit
          : communityPreferences.data?.me?.preferences.fileSizeUnit) ===
        "BINARY"
          ? "BINARY"
          : "DECIMAL"
      }
    />
  )
}

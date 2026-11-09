"use client"

import { usePersonalUsageQuery } from "@/infrastructure/graphql/generated"
import { Usage, emptyUsage, mapUsageProjection, type UsageData } from "@/features/usage"
import { usePersonalSettingsRefreshError } from "../usePersonalSettingsRefreshError"

/** Personal Context固有のGraphQL接続。共通のUsage UIはfeatures/usageが所有する。 */
export function ConnectedPersonalUsage() {
  const personal = usePersonalUsageQuery({
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  })

  let usage: UsageData = emptyUsage
  let conversionFailed = false
  const projection = personal.data?.me?.usage
  if (projection) {
    try {
      usage = mapUsageProjection(projection)
    } catch {
      conversionFailed = true
    }
  }

  const hasData = Boolean(projection) && !conversionFailed
  usePersonalSettingsRefreshError(Boolean(hasData && personal.error))
  const status = hasData ? "ready" : personal.loading ? "loading" : "error"

  return (
    <Usage
      scope="personal"
      usage={usage}
      status={status}
      fileSizeUnit={
        personal.data?.me?.preferences.fileSizeUnit === "BINARY"
          ? "BINARY"
          : "DECIMAL"
      }
      onRetry={() => {
        void personal.refetch().catch(() => undefined)
      }}
    />
  )
}

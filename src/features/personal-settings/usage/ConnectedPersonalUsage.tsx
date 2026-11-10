"use client"

import { usePersonalUsageQuery } from "@/infrastructure/graphql/generated"
import { UsageSection, emptyUsage, mapUsageProjection, type UsageData } from "@/features/usage"
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

  const onRetry = () => {
    void personal.refetch().catch(() => undefined)
  }

  return (
    <UsageSection
      status={status}
      onRetry={onRetry}
      scope="personal"
      usage={usage}
      fileSizeUnit={
        personal.data?.me?.preferences.fileSizeUnit === "BINARY"
            ? "BINARY"
            : "DECIMAL"
      }
    />
  )
}

"use client"

import { useCommunitySettingsUsageQuery } from "@/infrastructure/graphql/generated"
import { Usage, emptyUsage, mapUsageProjection, type UsageData } from "@/features/usage"
import type { SettingsSectionRender } from "@/ui/SettingsSectionHost"
import { useCommunitySettingsRefreshError } from "../useCommunitySettingsRefreshError"

/** One scoped read obtains the Usage and unit required by the active Section. */
export function ConnectedCommunityUsage({
  communityId,
  render,
}: {
  communityId: string
  render: SettingsSectionRender
}) {
  const query = useCommunitySettingsUsageQuery({
    variables: { communityId },
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  })
  const projection = query.data?.communityUsage
  let usage: UsageData = emptyUsage
  let conversionFailed = false
  if (projection) {
    try {
      usage = mapUsageProjection(projection)
    } catch {
      conversionFailed = true
    }
  }

  const ready = Boolean(projection) && !conversionFailed && Boolean(query.data?.me)
  useCommunitySettingsRefreshError(Boolean(ready && query.error))
  if (!ready) {
    return render(
      query.loading && !conversionFailed
        ? { status: "loading" }
        : {
            status: "error",
            retry: () => { void query.refetch().catch(() => undefined) },
          },
    )
  }

  return render({
    status: "ready",
    content: (
      <Usage
        key={communityId}
        scope="community"
        usage={usage}
        fileSizeUnit={query.data?.me?.preferences.fileSizeUnit === "BINARY" ? "BINARY" : "DECIMAL"}
      />
    ),
  })
}

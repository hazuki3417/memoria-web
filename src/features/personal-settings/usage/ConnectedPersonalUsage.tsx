"use client"

import { usePersonalUsageQuery } from "@/infrastructure/graphql/generated"
import { Usage, emptyUsage, mapUsageProjection, type UsageData } from "@/features/usage"
import type { SettingsSectionRender } from "@/ui/SettingsSectionHost"
import { usePersonalSettingsRefreshError } from "../usePersonalSettingsRefreshError"

/** Usage-scoped read and retry; status UI belongs to the common Host. */
export function ConnectedPersonalUsage({ render }: { render: SettingsSectionRender }) {
  const personal = usePersonalUsageQuery({
    fetchPolicy: "network-only",
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

  if (!hasData) {
    return render(
      personal.loading && !conversionFailed
        ? { status: "loading" }
        : {
            status: "error",
            retry: () => { void personal.refetch().catch(() => undefined) },
          },
    )
  }

  return render({
    status: "ready",
    content: (
      <Usage
        scope="personal"
        usage={usage}
        fileSizeUnit={
          personal.data?.me?.preferences.fileSizeUnit === "BINARY"
            ? "BINARY"
            : "DECIMAL"
        }
      />
    ),
  })
}

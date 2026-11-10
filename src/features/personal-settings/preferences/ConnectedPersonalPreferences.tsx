"use client"

import { useMediaQuery } from "@mantine/hooks"
import type { PageStatus } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { PersonalPreferencesSection } from "./PersonalPreferencesSection"
import { fromGraphqlUserPreferences } from "./userPreferencesGraphqlAdapter"
import { usePersonalPreferencesSave } from "./usePersonalPreferencesSave"
import { usePersonalSettingsInspection } from "../PersonalSettingsRoute/usePersonalSettingsInspection"

/** Preferences固有の保存・確認・GraphQL変換・Viewport依存を接続する。 */
export function ConnectedPersonalPreferences({
  status,
  preferences,
}: {
  status: PageStatus
  preferences?: Parameters<typeof fromGraphqlUserPreferences>[0]
}) {
  const { inspectPreferences } = usePersonalSettingsInspection()
  const { savePreferences } = usePersonalPreferencesSave()
  const compact = useMediaQuery("(max-width: 48em)")

  return (
    <PersonalPreferencesSection
      status={status}
      compact={compact}
      initialPreferences={
        preferences ? fromGraphqlUserPreferences(preferences) : undefined
      }
      onSave={savePreferences}
      onInspect={inspectPreferences}
    />
  )
}

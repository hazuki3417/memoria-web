"use client"

import { useMediaQuery } from "@mantine/hooks"
import { usePersonalSettingsPreferencesQuery } from "@/infrastructure/graphql/generated"
import { usePersonalSettingsInspection } from "../usePersonalSettingsInspection"
import { usePersonalSettingsRefreshError } from "../usePersonalSettingsRefreshError"
import { usePersonalPreferencesSave } from "./usePersonalPreferencesSave"
import { fromGraphqlUserPreferences } from "./userPreferencesGraphqlAdapter"

/** Preferencesの通信・保存Action・照会・Viewportを単一の画面入口へ渡す。 */
export function usePersonalPreferencesConnection() {
  const query = usePersonalSettingsPreferencesQuery({
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  })
  const { inspectPreferences } = usePersonalSettingsInspection()
  const { savePreferencesAction } = usePersonalPreferencesSave()
  const compact = useMediaQuery("(max-width: 48em)")
  const values = query.data?.me?.preferences

  usePersonalSettingsRefreshError(Boolean(values && query.error))

  return {
    initialPreferences: values ? fromGraphqlUserPreferences(values) : null,
    loading: query.loading,
    retry: () => { void query.refetch().catch(() => undefined) },
    compact,
    savePreferencesAction,
    inspectPreferences,
  }
}

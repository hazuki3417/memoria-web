"use client"

import { useMediaQuery } from "@mantine/hooks"
import { usePersonalSettingsPreferencesQuery } from "@/infrastructure/graphql/generated"
import type { SettingsSectionRender } from "@/ui/SettingsSectionHost"
import { usePersonalSettingsInspection } from "../usePersonalSettingsInspection"
import { usePersonalSettingsRefreshError } from "../usePersonalSettingsRefreshError"
import { PersonalPreferencesView } from "./PersonalPreferencesView"
import { usePersonalPreferencesSave } from "./usePersonalPreferencesSave"
import { fromGraphqlUserPreferences } from "./userPreferencesGraphqlAdapter"

/** Profileと同じQuery・Action・Host接続の入口。Ready ViewがFormのLifetimeを所有する。 */
export function PersonalPreferences({ render }: { render: SettingsSectionRender }) {
  const query = usePersonalSettingsPreferencesQuery({
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  })
  const { inspectPreferences } = usePersonalSettingsInspection()
  const { savePreferencesAction } = usePersonalPreferencesSave()
  const compact = useMediaQuery("(max-width: 48em)")
  const values = query.data?.me?.preferences

  usePersonalSettingsRefreshError(Boolean(values && query.error))

  if (!values) {
    return render(
      query.loading
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
      <PersonalPreferencesView
        compact={compact}
        initialPreferences={fromGraphqlUserPreferences(values)}
        onSaveAction={savePreferencesAction}
        onInspect={inspectPreferences}
      />
    ),
  })
}

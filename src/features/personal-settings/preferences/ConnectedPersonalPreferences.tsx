"use client"

import { useMediaQuery } from "@mantine/hooks"
import { usePersonalSettingsPreferencesQuery } from "@/infrastructure/graphql/generated"
import type { SettingsSectionRender } from "@/ui/SettingsSectionHost"
import { requireConfirmedSave } from "@/ui/SaveAction"
import { PersonalPreferences } from "./PersonalPreferences"
import { fromGraphqlUserPreferences } from "./userPreferencesGraphqlAdapter"
import { usePersonalPreferencesSave } from "./usePersonalPreferencesSave"
import { usePersonalSettingsInspection } from "../usePersonalSettingsInspection"
import { usePersonalSettingsRefreshError } from "../usePersonalSettingsRefreshError"

/** Preferences-scoped authoritative read, save and display projection. */
export function ConnectedPersonalPreferences({ render }: { render: SettingsSectionRender }) {
  const preferences = usePersonalSettingsPreferencesQuery({
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  })
  const { inspectPreferences } = usePersonalSettingsInspection()
  const { savePreferences } = usePersonalPreferencesSave()
  const compact = useMediaQuery("(max-width: 48em)")
  const values = preferences.data?.me?.preferences

  usePersonalSettingsRefreshError(Boolean(values && preferences.error))
  if (!values) {
    return render(
      preferences.loading
        ? { status: "loading" }
        : {
            status: "error",
            retry: () => { void preferences.refetch().catch(() => undefined) },
          },
    )
  }

  return render({
    status: "ready",
    content: (
      <PersonalPreferences
        compact={compact}
        initialPreferences={fromGraphqlUserPreferences(values)}
        onSave={async (patch) => requireConfirmedSave(await savePreferences(patch))}
        onInspect={inspectPreferences}
      />
    ),
  })
}

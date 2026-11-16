"use client"

import { useMediaQuery } from "@mantine/hooks"
import { usePersonalSettingsPreferencesQuery } from "@/infrastructure/graphql/generated"
import type { SettingsSectionRender } from "@/ui/SettingsSectionHost"
import { usePersonalSettingsRefreshError } from "../usePersonalSettingsRefreshError"
import { PersonalPreferencesView } from "./PersonalPreferencesView"
import { usePersonalPreferencesSave } from "./usePersonalPreferencesSave"
import { fromGraphqlPersonalPreferences } from "./personalPreferencesGraphqlAdapter"

/** Profileと同じQuery・Action・Host接続の入口。Ready ViewがFormのLifetimeを所有する。 */
export const PersonalPreferences = ({ render }: { render: SettingsSectionRender }) => {
  const query = usePersonalSettingsPreferencesQuery({
    fetchPolicy: "network-only",
    refetchWritePolicy: "merge",
    notifyOnNetworkStatusChange: true,
  })
  const userId = query.data?.me?.id
  const operations = usePersonalPreferencesSave(userId)
  const compact = useMediaQuery("(max-width: 48em)")
  const values = query.data?.me?.preferences

  usePersonalSettingsRefreshError(Boolean(values && query.error))

  if (!values || !userId) {
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
        key={userId}
        compact={compact}
        initialPreferences={fromGraphqlPersonalPreferences(values)}
        operations={operations}
      />
    ),
  })
}

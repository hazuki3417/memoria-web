"use client"

import { usePersonalSettingsProfileQuery } from "@/infrastructure/graphql/generated"
import type { SettingsSectionRender } from "@/ui/SettingsSectionHost"
import { PersonalProfile } from "./PersonalProfile"
import { usePersonalProfileSave } from "./usePersonalProfileSave"
import { usePersonalSettingsInspection } from "../usePersonalSettingsInspection"
import { usePersonalSettingsRefreshError } from "../usePersonalSettingsRefreshError"

/** Profile-scoped authoritative read, actions and status interpretation. */
export function ConnectedPersonalProfile({ render }: { render: SettingsSectionRender }) {
  const profile = usePersonalSettingsProfileQuery({
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  })
  const { inspectProfile } = usePersonalSettingsInspection()
  const { saveProfile } = usePersonalProfileSave()
  const nickname = profile.data?.me?.profile.nickname

  usePersonalSettingsRefreshError(Boolean(nickname !== undefined && profile.error))
  if (nickname === undefined) {
    return render(
      profile.loading
        ? { status: "loading" }
        : {
            status: "error",
            retry: () => { void profile.refetch().catch(() => undefined) },
          },
    )
  }

  return render({
    status: "ready",
    content: (
      <PersonalProfile
        onSave={saveProfile}
        onInspect={inspectProfile}
        initialNickname={nickname}
      />
    ),
  })
}

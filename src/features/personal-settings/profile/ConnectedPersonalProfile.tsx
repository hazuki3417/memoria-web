"use client"

import { usePersonalSettingsProfileQuery } from "@/infrastructure/graphql/generated"
import type { SettingsSectionRender } from "@/ui/SettingsSectionHost"
import { usePersonalSettingsRefreshError } from "../usePersonalSettingsRefreshError"
import { PersonalProfile } from "./PersonalProfile"
import { usePersonalProfileSave } from "./usePersonalProfileSave"

/**
 * Composes the Profile Query, mutation Action, and recovery read.
 * The screen only mounts after the required server data is available.
 */
export function ConnectedPersonalProfile({
  render,
}: {
  render: SettingsSectionRender
}) {
  const query = usePersonalSettingsProfileQuery({
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  })
  const { saveProfile, inspectProfile } = usePersonalProfileSave()
  const nickname = query.data?.me?.profile.nickname

  usePersonalSettingsRefreshError(nickname !== undefined && Boolean(query.error))

  if (nickname === undefined) {
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
      <PersonalProfile
        initialNickname={nickname}
        onSave={saveProfile}
        onInspect={inspectProfile}
      />
    ),
  })
}

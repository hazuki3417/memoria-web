"use client"

import { usePersonalSettingsProfileQuery } from "@/infrastructure/graphql/generated"
import type { SettingsSectionRender } from "@/ui/SettingsSectionHost"
import { usePersonalSettingsRefreshError } from "../usePersonalSettingsRefreshError"
import { PersonalProfile } from "./PersonalProfile"
import { usePersonalProfileSave } from "./usePersonalProfileSave"

/** Profile設定画面に必要なデータ取得・保存・現状照会を接続し、取得状態に応じて適切な画面を提供する。 */
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

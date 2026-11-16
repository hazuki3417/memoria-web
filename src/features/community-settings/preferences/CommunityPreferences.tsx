"use client"

import type { SettingsSectionRender } from "@/ui/SettingsSectionHost"
import { useCommunityMySettingsQuery } from "@/infrastructure/graphql/generated"
import { useCommunitySettingsRefreshError } from "../useCommunitySettingsRefreshError"
import { CommunityPreferencesReady } from "./CommunityPreferencesReady"
import { useCommunityPreferencesSave } from "./useCommunityPreferencesSave"
import { useCommunityAliasSave } from "./CommunityAliasSection/useCommunityAliasSave"

/** Community環境設定のQuery・Action・Host接続を提供し、Ready画面に保存の生存期間を委ねる。 */
export const CommunityPreferences = ({
  communityId,
  render,
}: {
  communityId: string
  render: SettingsSectionRender
}) => {
  const query = useCommunityMySettingsQuery({
    variables: { communityId },
    fetchPolicy: "network-only",
  })
  const operations = useCommunityPreferencesSave(communityId)
  const alias = useCommunityAliasSave(communityId)
  const settings = query.data?.community?.mySettings

  useCommunitySettingsRefreshError(Boolean(query.data?.community && query.error))

  if (!settings) {
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
      <CommunityPreferencesReady
        key={communityId}
        communityId={communityId}
        preferences={{ accentColor: settings.accentColor }}
        savedAlias={settings.alias}
        operations={operations}
        alias={alias}
      />
    ),
  })
}

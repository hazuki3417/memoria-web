"use client"

import { useMemo } from "react"
import { useCommunityAccentPreview } from "@/features/application-shell"
import type { SettingsSectionRender } from "@/ui/SettingsSectionHost"
import { useCommunityMySettingsQuery } from "@/infrastructure/graphql/generated"
import { useCommunitySettingsRefreshError } from "../useCommunitySettingsRefreshError"
import { CommunityPreferencesView } from "./CommunityPreferencesView"
import { useCommunityPreferencesSave } from "./useCommunityPreferencesSave"
import { fromGraphqlCommunityPreferences } from "./communityPreferencesGraphqlAdapter"
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
    refetchWritePolicy: "merge",
  })
  const operations = useCommunityPreferencesSave(communityId)
  const alias = useCommunityAliasSave(communityId)
  const { setPreview, clearPreview } = useCommunityAccentPreview()
  const preview = useMemo(() => ({
    preview: (color: string) => setPreview(communityId, color),
    release: (owner: number) => clearPreview(communityId, owner),
  }), [communityId, setPreview, clearPreview])
  const community = query.data?.community
  const settings = community?.id === communityId ? community.mySettings : undefined

  useCommunitySettingsRefreshError(Boolean(settings && query.error))

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
      <CommunityPreferencesView
        key={communityId}
        accent={fromGraphqlCommunityPreferences(settings).accentColor}
        isPreview={false}
        operations={operations}
        preview={preview}
        alias={{
          savedAlias: settings.alias,
          onInspect: alias.inspectAlias,
          onConfirm: alias.confirmAlias,
          onSave: alias.saveAlias,
        }}
      />
    ),
  })
}

"use client"

import type { SettingsSectionRender } from "@/ui/SettingsSectionHost"
import { CommunityPreferencesSection } from "../CommunityPreferencesSection"
import { useCommunityPreferencesConnection } from "./useCommunityPreferencesConnection"
import { useCommunityAliasConnection } from "./useCommunityAliasConnection"

/** Query/Mutation/session stays mounted while the Host renders Loading/Error. */
export function ConnectedCommunityPreferences({
  communityId,
  render,
}: {
  communityId: string
  render: SettingsSectionRender
}) {
  const model = useCommunityPreferencesConnection(communityId)
  const alias = useCommunityAliasConnection(communityId)
  const settings = model.data?.community?.mySettings

  if (!settings) {
    return render(
      model.loading
        ? { status: "loading" }
        : {
            status: "error",
            retry: () => { void model.refetch().catch(() => undefined) },
          },
    )
  }

  return render({
    status: "ready",
    content: (
      <CommunityPreferencesSection
        communityId={communityId}
        settings={settings}
        snapshot={model.snapshot}
        controller={model.controller}
        canResave={model.canResave}
        alias={alias}
      />
    ),
  })
}

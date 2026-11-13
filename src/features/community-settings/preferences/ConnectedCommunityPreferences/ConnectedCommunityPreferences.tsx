"use client"

import type { SettingsSectionRender } from "@/ui/SettingsSectionHost"
import { CommunityPreferencesSection } from "../CommunityPreferencesSection"
import { useCommunityPreferencesConnection } from "./useCommunityPreferencesConnection"
import { useCommunityAliasSave } from "../CommunityAliasSection/useCommunityAliasSave"

/** Query remains mounted through Host states; Ready view owns save lifetime. */
export function ConnectedCommunityPreferences({
  communityId,
  render,
}: {
  communityId: string
  render: SettingsSectionRender
}) {
  const model = useCommunityPreferencesConnection(communityId)
  const alias = useCommunityAliasSave(communityId)
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
        key={communityId}
        communityId={communityId}
        settings={settings}
        alias={alias}
      />
    ),
  })
}

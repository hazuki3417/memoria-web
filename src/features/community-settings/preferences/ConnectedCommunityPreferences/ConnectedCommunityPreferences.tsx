"use client"

import { CommunityPreferencesSection } from "../CommunityPreferencesSection"
import { useCommunityPreferencesConnection } from "./useCommunityPreferencesConnection"
import { useCommunityAliasConnection } from "./useCommunityAliasConnection"

/** Query・Mutation・保存Sessionを接続し、状態表示とUIはSectionに委譲する。 */
export function ConnectedCommunityPreferences({
  communityId,
}: {
  communityId: string
}) {
  const model = useCommunityPreferencesConnection(communityId)
  const alias = useCommunityAliasConnection(communityId)

  return (
    <CommunityPreferencesSection
      communityId={communityId}
      model={model}
      alias={alias}
    />
  )
}

"use client"

import { useCommunityMySettingsQuery } from "@/infrastructure/graphql/generated"
import { useOptionalCommunityAccentPreview } from "@/features/application-shell"

/** Navigation用Accentだけを取得・解決する。Access確認とSection取得はそれぞれのownerが行う。 */
export const useCommunitySettingsAccentColor = (communityId: string) => {
  // The enclosing CommunityAccessBoundary owns access verification.
  // Settings reads its own accent; myCommunities remains Switcher-only.
  const { data: settingsData } = useCommunityMySettingsQuery({
    variables: { communityId },
    fetchPolicy: "cache-first",
    refetchWritePolicy: "merge",
  })
  const preview = useOptionalCommunityAccentPreview()
  const community = settingsData?.community
  const confirmedAccent = community?.id === communityId ? community.mySettings.accentColor : undefined
  const communityAccentColor = preview?.previews[communityId]?.color ?? confirmedAccent
  return { communityAccentColor }
}

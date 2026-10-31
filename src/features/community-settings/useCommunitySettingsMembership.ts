"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMyCommunitiesQuery } from "@/infrastructure/graphql/generated"
import type { CommunitySettingsSection } from "./communitySettingsSections"

/** Resolve current membership and preserve the Preferences membership-loss redirect. */
export function useCommunitySettingsMembership(
  communityId: string,
  section: CommunitySettingsSection,
) {
  const router = useRouter()
  const { data, loading, error } = useMyCommunitiesQuery()
  const membership = data?.myCommunities.find((item) => item.id === communityId)
  const membershipLost =
    section === "preferences" &&
    !loading &&
    !error &&
    !!data &&
    !membership

  useEffect(() => {
    if (membershipLost) router.replace("/dashboard")
  }, [membershipLost, router])

  return {
    communityAccentColor: membership?.mySettings.accentColor,
    membershipLost,
  }
}

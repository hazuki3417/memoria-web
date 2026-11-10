"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCommunitySettingsMembershipQuery } from "@/infrastructure/graphql/generated"
import { useCommunitySettingsRefreshError } from "../useCommunitySettingsRefreshError"
import type { CommunitySettingsSection } from "../communitySettingsSections"

/** Minimal route-level read for accent and Preferences membership redirect. */
export function useCommunitySettingsMembership(
  communityId: string,
  section: CommunitySettingsSection,
) {
  const router = useRouter()
  const { data, loading, error } = useCommunitySettingsMembershipQuery({
    fetchPolicy: "network-only",
  })
  const membership = data?.myCommunities.find((item) => item.id === communityId)
  const membershipLost =
    section === "preferences" && !loading && !error && !!data && !membership

  useCommunitySettingsRefreshError(Boolean(data && error))
  useEffect(() => {
    if (membershipLost) router.replace("/dashboard")
  }, [membershipLost, router])

  return {
    communityAccentColor: membership?.mySettings.accentColor,
    membershipLost,
  }
}

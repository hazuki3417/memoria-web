"use client"

import { useCommunitySettingsMembershipQuery } from "@/infrastructure/graphql/generated"
import { useCommunitySettingsRefreshError } from "../useCommunitySettingsRefreshError"
import { getCommunityMembershipStatus } from "./communityMembershipStatus"

/** Resolve membership for every Community Settings section before mounting its Controller. */
export function useCommunitySettingsAccessState(communityId: string) {
  const { data, loading, error, refetch } = useCommunitySettingsMembershipQuery({
    fetchPolicy: "network-only",
  })
  const membership = data?.myCommunities.find((item) => item.id === communityId)

  useCommunitySettingsRefreshError(Boolean(data && error))

  const status = getCommunityMembershipStatus({
    loading,
    failed: Boolean(error),
    hasData: Boolean(data),
    isMember: Boolean(membership),
  })

  return {
    status,
    communityAccentColor: membership?.mySettings.accentColor,
    retry: () => {
      void refetch().catch(() => undefined)
    },
  }
}

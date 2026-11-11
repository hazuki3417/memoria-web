"use client"

import { useCommunitySettingsMembershipQuery } from "@/infrastructure/graphql/generated"
import { useCommunitySettingsRefreshError } from "../useCommunitySettingsRefreshError"

export type CommunityMembershipStatus = "loading" | "error" | "not-member" | "ready"

/** Resolve membership for every Community Settings section before mounting its Controller. */
export function useCommunitySettingsMembership(communityId: string) {
  const { data, loading, error, refetch } = useCommunitySettingsMembershipQuery({
    fetchPolicy: "network-only",
  })
  const membership = data?.myCommunities.find((item) => item.id === communityId)

  useCommunitySettingsRefreshError(Boolean(data && error))

  const status: CommunityMembershipStatus = loading
    ? "loading"
    : error || !data
      ? "error"
      : membership
        ? "ready"
        : "not-member"

  return {
    status,
    communityAccentColor: membership?.mySettings.accentColor,
    retry: () => {
      void refetch().catch(() => undefined)
    },
  }
}

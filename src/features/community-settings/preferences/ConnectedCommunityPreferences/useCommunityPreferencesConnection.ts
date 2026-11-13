"use client"

import { useCommunitySettingsRefreshError } from "../../useCommunitySettingsRefreshError"
import { useCommunityMySettingsQuery } from "@/infrastructure/graphql/generated"

/** Preferences-scoped authoritative read; saving belongs to the Ready view lifetime. */
export function useCommunityPreferencesConnection(communityId: string) {
  const { data, loading, error, refetch } = useCommunityMySettingsQuery({
    variables: { communityId },
    fetchPolicy: "network-only",
  })
  useCommunitySettingsRefreshError(Boolean(data?.community && error))
  return { data, loading, refetch }
}

"use client"

import { useCommunity } from "@/features/community/CommunityProvider"
import { useCommunitySettingsMembership } from "./useCommunitySettingsMembership"
import { useCommunitySettingsRefreshError } from "../useCommunitySettingsRefreshError"
import type { CommunitySettingsSection } from "../communitySettingsSections"
import type { PageStatus } from "@/components/PageStatusBoundary/PageStatusBoundary"

/** Owns Community Settings read state and the membership-loss guard. */
export function useCommunitySettingsData(communityId: string, section: CommunitySettingsSection) {
  const { communityAccentColor, membershipLost } =
    useCommunitySettingsMembership(communityId, section)
  // UsageはCommunityの登録量を閲覧する画面であり、メンバー一覧を必要としない。
  const requiresMembers = section === "members" || section === "general"
  const { name, members, loadError, membersError } = useCommunity({
    includeMembers: requiresMembers,
  })

  const hasRequiredData =
    name !== null && (!requiresMembers || members !== null)
  useCommunitySettingsRefreshError(
    Boolean(
      hasRequiredData && (loadError || (requiresMembers && membersError)),
    ),
  )

  const loadState: PageStatus = hasRequiredData
    ? "ready"
    : loadError || (requiresMembers && membersError)
      ? "error"
      : "loading"

  return { communityAccentColor, membershipLost, name, members, loadState }
}

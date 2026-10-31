"use client"

import { ConnectedCommunityPreferences } from "./ConnectedCommunityPreferences"
import { useCommunitySettingsMembership } from "./useCommunitySettingsMembership"
import { useCommunitySettingsActions } from "./useCommunitySettingsActions"
import type { ReactNode } from "react"
import { PageStatusBoundary } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { useSettingsRefreshError } from "@/features/settings/useSettingsRefreshError"
import { LoadingBoundary } from "@/components/LoadingBoundary/LoadingBoundary"
import { useRouter } from "next/navigation"
import { useCommunity } from "@/features/community/CommunityProvider"
import {
  CommunitySettings,
  type CommunitySettingsSection,
} from "./CommunitySettings"

export function CommunitySettingsRoute({
  communityId,
  section = "general",
  usageContent,
}: {
  communityId: string
  section?: CommunitySettingsSection
  usageContent?: ReactNode
}) {
  const router = useRouter()
  const { communityAccentColor, membershipLost } = useCommunitySettingsMembership(communityId, section)
  // UsageはCommunityの登録量を閲覧する画面であり、メンバー一覧を必要としない。
  const requiresMembers = section === "members" || section === "general"
  const { name, members, loadError, membersError } = useCommunity({
    includeMembers: requiresMembers,
  })
  const { onRemoveMember, onLeaveCommunity, onChangeMemberRole, onSaveName } =
    useCommunitySettingsActions(communityId)

  const hasRequiredData = name !== null && (!requiresMembers || members !== null)
  useSettingsRefreshError(Boolean(hasRequiredData && (loadError || (requiresMembers && membersError))))

  if (membershipLost)
    return (
      <LoadingBoundary loading label="Communityの利用権限を確認中">
        {null}
      </LoadingBoundary>
    )
  const loadState = hasRequiredData
    ? "ready"
    : loadError || (requiresMembers && membersError)
      ? "error"
      : "loading"

  return (
    <CommunitySettings
      communityId={communityId}
      communityAccentColor={communityAccentColor}
      communityName={name ?? undefined}
      contentOverride={loadState !== "ready" ? <PageStatusBoundary state={loadState} label="Community設定を読み込み中">{null}</PageStatusBoundary> : undefined}
      members={members ?? undefined}
      role={members?.find((member) => member.isSelf)?.role ?? "member"}
      section={section}
      usageContent={usageContent}
      preferencesContent={
        section === "preferences" ? (
          <ConnectedCommunityPreferences communityId={communityId} />
        ) : undefined
      }
      onRemoveMember={onRemoveMember}
      onLeaveCommunity={onLeaveCommunity}
      onLeaveSuccess={() => router.push("/dashboard")}
      onChangeMemberRole={onChangeMemberRole}
      onNavigate={(href) => router.push(href)}
      onSaveName={onSaveName}
    />
  )
}

"use client"

import { ConnectedCommunityPreferences } from "../preferences/ConnectedCommunityPreferences"
import { useCommunitySettingsActions } from "./useCommunitySettingsActions"
import { useCommunitySettingsData } from "./useCommunitySettingsData"
import { useCommunityNameInspection } from "./useCommunityNameInspection"
import type { ReactNode } from "react"
import { PageStatusBoundary } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { LoadingBoundary } from "@/components/LoadingBoundary/LoadingBoundary"
import { useRouter } from "next/navigation"
import { CommunitySettings } from "../CommunitySettings"
import type { CommunitySettingsSection } from "../communitySettingsSections"

export type CommunitySettingsRouteProps = {
  communityId: string
  section?: CommunitySettingsSection
  usageContent?: ReactNode
}

export function CommunitySettingsRoute({
  communityId,
  section = "general",
  usageContent,
}: CommunitySettingsRouteProps) {
  const router = useRouter()
  const onInspectName = useCommunityNameInspection(communityId)
  const { communityAccentColor, membershipLost, name, members, loadState } =
    useCommunitySettingsData(communityId, section)
  const { onRemoveMember, onLeaveCommunity, onChangeMemberRole, onSaveName } =
    useCommunitySettingsActions(communityId)

  if (membershipLost)
    return (
      <LoadingBoundary loading label="Communityの利用権限を確認中">
        {null}
      </LoadingBoundary>
    )

  return (
    <CommunitySettings
      key={communityId}
      communityId={communityId}
      invitationMode="unavailable"
      communityAccentColor={communityAccentColor}
      communityName={name ?? undefined}
      contentOverride={
        loadState !== "ready" ? (
          <PageStatusBoundary
            state={loadState}
            label="Community設定を読み込み中"
          >
            {null}
          </PageStatusBoundary>
        ) : undefined
      }
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
      onSectionChange={(_section, href) => router.push(href)}
      onSaveName={onSaveName}
      onInspectName={onInspectName}
    />
  )
}

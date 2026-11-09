"use client"

import { ConnectedCommunityPreferences } from "../preferences/ConnectedCommunityPreferences"
import { ConnectedCommunityUsage } from "../usage/ConnectedCommunityUsage"
import { useCommunitySettingsActions } from "./useCommunitySettingsActions"
import { useCommunitySettingsData } from "./useCommunitySettingsData"
import { useCommunityNameInspection } from "./useCommunityNameInspection"
import { LoadingBoundary } from "@/components/LoadingBoundary/LoadingBoundary"
import { useRouter } from "next/navigation"
import { CommunitySettingsView } from "../CommunitySettingsView"
import { renderCommunitySettingsSection } from "../communitySettingsSectionContent"
import {
  getCommunitySettingsSections,
  type CommunitySettingsSection,
} from "../communitySettingsSections"

export type CommunitySettingsRouteProps = {
  communityId: string
  section?: CommunitySettingsSection
}

export function CommunitySettingsRoute({
  communityId,
  section = "general",
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

  const content = renderCommunitySettingsSection({
    section,
    communityId,
    invitationMode: "unavailable",
    communityName: name ?? undefined,
    members: members ?? undefined,
    role: members?.find((member) => member.isSelf)?.role ?? "member",
    usageContent: section === "usage" ? <ConnectedCommunityUsage communityId={communityId} /> : undefined,
    preferencesContent: section === "preferences" ? <ConnectedCommunityPreferences communityId={communityId} /> : undefined,
    onRemoveMember,
    onLeaveCommunity,
    onLeaveSuccess: () => router.push("/dashboard"),
    onChangeMemberRole,
    onSaveName,
    onInspectName,
  })

  return (
    <CommunitySettingsView
      key={communityId}
      communityId={communityId}
      section={section}
      communityAccentColor={communityAccentColor}
      loadState={loadState}
      content={content}
      onSectionChange={(nextSection) => {
        const target = getCommunitySettingsSections(communityId).find(
          (item) => item.id === nextSection,
        )
        if (target) router.push(target.href)
      }}
      onSaveName={onSaveName}
      onInspectName={onInspectName}
    />
  )
}

"use client"

import { ConnectedCommunityPreferences } from "../preferences/ConnectedCommunityPreferences"
import { ConnectedCommunityUsage } from "../usage/ConnectedCommunityUsage"
import { useCommunitySettingsActions } from "./useCommunitySettingsActions"
import { useCommunitySettingsData } from "./useCommunitySettingsData"
import { useCommunityNameInspection } from "./useCommunityNameInspection"
import { LoadingBoundary } from "@/components/LoadingBoundary/LoadingBoundary"
import { useRouter } from "next/navigation"
import { CommunitySettingsView } from "../CommunitySettingsView"
import type { ReactNode } from "react"
import { CommunityGeneral } from "../general/CommunityGeneral"
import { CommunityMembers } from "../members"
import type { CommunityInvitationSectionProps } from "../general/CommunityInvitationSection"
import {
  getCommunitySettingsSections,
  type CommunitySettingsSection,
} from "../communitySettingsSections"

// Production Invitation API is not connected. Preview actions remain unavailable.
const unavailableInvitation: Omit<CommunityInvitationSectionProps, "isAdmin" | "available"> = {
  active: false,
  invitation: "none",
  invitationUrl: "",
  expiresAt: "",
  busy: false,
  issue: () => undefined,
  copyInvitation: async () => undefined,
  confirm: null,
  setConfirm: () => undefined,
  changeInvitation: () => undefined,
}

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

  let content: ReactNode
  switch (section) {
    case "general":
      content = (
        <CommunityGeneral
          name={{ communityName: name ?? undefined, onSaveName, onInspectName }}
          invitation={unavailableInvitation}
          invitationAvailable={false}
          communityId={communityId}
          isAdmin={members?.find((member) => member.isSelf)?.role === "admin"}
        />
      )
      break
    case "members":
      content = (
        <CommunityMembers
          members={members ?? undefined}
          onChangeRole={onChangeMemberRole}
          onRemoveMember={onRemoveMember}
          onLeave={onLeaveCommunity}
          onLeaveSuccess={() => router.push("/dashboard")}
        />
      )
      break
    case "usage":
      content = <ConnectedCommunityUsage communityId={communityId} />
      break
    case "preferences":
      content = <ConnectedCommunityPreferences communityId={communityId} />
      break
  }

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
    />
  )
}

"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { LoadingBoundary } from "@/components/LoadingBoundary/LoadingBoundary"
import { ConnectedCommunityGeneral } from "../general/ConnectedCommunityGeneral"
import { ConnectedCommunityMembers } from "../members/ConnectedCommunityMembers"
import { ConnectedCommunityPreferences } from "../preferences/ConnectedCommunityPreferences"
import { ConnectedCommunityUsage } from "../usage/ConnectedCommunityUsage"
import { CommunitySettingsView } from "../CommunitySettingsView"
import { CommunitySettingsContextBoundary } from "./CommunitySettingsContextBoundary"
import { useCommunitySettingsData } from "./useCommunitySettingsData"
import {
  getCommunitySettingsSections,
  type CommunitySettingsSection,
} from "../communitySettingsSections"

export type CommunitySettingsRouteProps = {
  communityId: string
  section?: CommunitySettingsSection
}

/** Community Contextの可用性、Section選択、Navigation、Viewを構成する。 */
export function CommunitySettingsRoute({
  communityId,
  section = "general",
}: CommunitySettingsRouteProps) {
  const router = useRouter()
  const { communityAccentColor, membershipLost, name, members, loadState } =
    useCommunitySettingsData(communityId, section)

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
        <ConnectedCommunityGeneral
          communityId={communityId}
          name={name}
          isAdmin={members?.find((member) => member.isSelf)?.role === "admin"}
        />
      )
      break
    case "members":
      content = (
        <ConnectedCommunityMembers
          communityId={communityId}
          members={members ?? undefined}
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
      content={
        <CommunitySettingsContextBoundary status={loadState}>
          {content}
        </CommunitySettingsContextBoundary>
      }
      onSectionChange={(nextSection) => {
        const target = getCommunitySettingsSections(communityId).find(
          (item) => item.id === nextSection,
        )
        if (target) router.push(target.href)
      }}
    />
  )
}

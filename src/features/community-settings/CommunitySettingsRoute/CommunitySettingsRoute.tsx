"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { LoadingBoundary } from "@/components/LoadingBoundary/LoadingBoundary"
import { SettingsSectionHost, type SettingsSectionRender } from "@/ui/SettingsSectionHost"
import { ConnectedCommunityGeneral } from "../general/ConnectedCommunityGeneral"
import { ConnectedCommunityMembers } from "../members/ConnectedCommunityMembers"
import { ConnectedCommunityPreferences } from "../preferences/ConnectedCommunityPreferences"
import { ConnectedCommunityUsage } from "../usage/ConnectedCommunityUsage"
import { CommunitySettingsView } from "../CommunitySettingsView"
import { useCommunitySettingsMembership } from "./useCommunitySettingsMembership"
import {
  getCommunitySettingsSections,
  type CommunitySettingsSection,
} from "../communitySettingsSections"

const sectionStatusMessages = {
  general: {
    label: "一般設定を読み込み中",
    errorTitle: "一般設定を取得できませんでした",
  },
  members: {
    label: "メンバー情報を読み込み中",
    errorTitle: "メンバー情報を取得できませんでした",
  },
  preferences: {
    label: "Community環境設定を読み込み中",
    errorTitle: "Community環境設定を取得できませんでした",
  },
  usage: {
    label: "利用状況を読み込み中",
    errorTitle: "利用状況を取得できませんでした",
  },
} satisfies Record<CommunitySettingsSection, { label: string; errorTitle: string }>

export type CommunitySettingsRouteProps = {
  communityId: string
  section?: CommunitySettingsSection
}

/** Selects one Controller; only membership and navigation remain in Route. */
export function CommunitySettingsRoute({
  communityId,
  section = "general",
}: CommunitySettingsRouteProps) {
  const router = useRouter()
  const { communityAccentColor, membershipLost } =
    useCommunitySettingsMembership(communityId, section)

  if (membershipLost)
    return (
      <LoadingBoundary loading label="Communityの利用権限を確認中">
        {null}
      </LoadingBoundary>
    )

  let controller: (render: SettingsSectionRender) => ReactNode

  switch (section) {
    case "general":
      controller = (render) => (
        <ConnectedCommunityGeneral communityId={communityId} render={render} />
      )
      break
    case "members":
      controller = (render) => (
        <ConnectedCommunityMembers
          communityId={communityId}
          onLeaveSuccess={() => router.push("/dashboard")}
          render={render}
        />
      )
      break
    case "usage":
      controller = (render) => (
        <ConnectedCommunityUsage communityId={communityId} render={render} />
      )
      break
    case "preferences":
      controller = (render) => (
        <ConnectedCommunityPreferences communityId={communityId} render={render} />
      )
      break
  }

  const { label, errorTitle } = sectionStatusMessages[section]

  return (
    <CommunitySettingsView
      key={communityId}
      communityId={communityId}
      section={section}
      communityAccentColor={communityAccentColor}
      content={
        <SettingsSectionHost label={label} errorTitle={errorTitle}>
          {controller}
        </SettingsSectionHost>
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

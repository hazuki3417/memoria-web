"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { SettingsSectionHost, type SettingsSectionRender } from "@/ui/SettingsSectionHost"
import { CommunityGeneral } from "../general"
import { CommunityMembers } from "../members"
import { CommunityPreferences } from "../preferences"
import { CommunityUsage } from "../usage"
import { CommunitySettingsView } from "../CommunitySettingsView"
import { useCommunitySettingsAccentColor } from "./useCommunitySettingsAccentColor"
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

/** Selects one Section controller and keeps Settings navigation/accent wiring. */
export const CommunitySettingsRoute = ({
  communityId,
  section = "general",
}: CommunitySettingsRouteProps) => {
  const router = useRouter()
  const { communityAccentColor } = useCommunitySettingsAccentColor(communityId)

  let controller: (render: SettingsSectionRender) => ReactNode

  switch (section) {
    case "general":
      controller = (render) => (
        <CommunityGeneral communityId={communityId} render={render} />
      )
      break
    case "members":
      controller = (render) => (
        <CommunityMembers
          communityId={communityId}
          onLeaveSuccess={() => router.push("/dashboard")}
          render={render}
        />
      )
      break
    case "usage":
      controller = (render) => (
        <CommunityUsage communityId={communityId} render={render} />
      )
      break
    case "preferences":
      controller = (render) => (
        <CommunityPreferences communityId={communityId} render={render} />
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
      onSectionChange={(nextSection) => {
        const target = getCommunitySettingsSections(communityId).find(
          (item) => item.id === nextSection,
        )
        if (target) router.push(target.href)
      }}
      content={
        <SettingsSectionHost label={label} errorTitle={errorTitle}>
          {controller}
        </SettingsSectionHost>
      }
    />
  )
}

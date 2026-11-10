"use client"

import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { PersonalSettingsView } from "../PersonalSettingsView"
import type { PersonalSettingsSection } from "../personalSettingsSections"
import { ConnectedPersonalProfile } from "../profile/ConnectedPersonalProfile"
import { ConnectedPersonalPreferences } from "../preferences/ConnectedPersonalPreferences"
import { ConnectedPersonalUsage } from "../usage/ConnectedPersonalUsage"
import { PersonalAccountSection } from "../account/PersonalAccountSection"
import { usePersonalSettingsReadState } from "./usePersonalSettingsReadState"
import { usePersonalSettingsRefreshError } from "../usePersonalSettingsRefreshError"

export type PersonalSettingsRouteProps = { section: PersonalSettingsSection }

/** Section選択、共通CurrentUser状態、Navigation、ViewのCompositionを所有する。 */
export function PersonalSettingsRoute({ section }: PersonalSettingsRouteProps) {
  const router = useRouter()
  const { data, error, personalAccentColor, loadState } =
    usePersonalSettingsReadState()
  usePersonalSettingsRefreshError(Boolean(data?.me && error))

  const onSectionChange = (nextSection: PersonalSettingsSection) => {
    router.push(`/settings/${nextSection}`)
  }

  let content: ReactNode
  switch (section) {
    case "profile":
      content = (
        <ConnectedPersonalProfile
          status={loadState}
          initialNickname={data?.me?.profile.nickname}
        />
      )
      break
    case "preferences":
      content = (
        <ConnectedPersonalPreferences
          status={loadState}
          preferences={data?.me?.preferences}
        />
      )
      break
    case "account":
      content = <PersonalAccountSection status={loadState} />
      break
    case "usage":
      // Usageは専用Queryの状態を表示する。CurrentUser取得状態では遮らない。
      content = <ConnectedPersonalUsage />
      break
  }

  return (
    <PersonalSettingsView
      key={section}
      section={section}
      content={content}
      personalAccentColor={personalAccentColor}
      onSectionChange={onSectionChange}
    />
  )
}

"use client"

import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { SettingsSectionHost, type SettingsSectionRender } from "@/ui/SettingsSectionHost"
import { PersonalSettingsView } from "../PersonalSettingsView"
import type { PersonalSettingsSection } from "../personalSettingsSections"
import { ConnectedPersonalProfile } from "../profile/ConnectedPersonalProfile"
import { ConnectedPersonalPreferences } from "../preferences/ConnectedPersonalPreferences"
import { ConnectedPersonalUsage } from "../usage/ConnectedPersonalUsage"
import { Account } from "../account/Account"
import { usePersonalSettingsAccentColor } from "./usePersonalSettingsAccentColor"

const sectionStatusMessages = {
  profile: {
    label: "プロフィールを読み込み中",
    errorTitle: "プロフィールを取得できませんでした",
  },
  preferences: {
    label: "環境設定を読み込み中",
    errorTitle: "環境設定を取得できませんでした",
  },
  account: {
    // Account renders Ready without a Section data Query.
    label: "アカウント設定を読み込み中",
    errorTitle: "アカウント設定を取得できませんでした",
  },
  usage: {
    label: "利用状況を読み込み中",
    errorTitle: "利用状況を取得できませんでした",
  },
} satisfies Record<PersonalSettingsSection, { label: string; errorTitle: string }>

export type PersonalSettingsRouteProps = { section: PersonalSettingsSection }

/** Selects one Controller; the same Host governs every Section status. */
export function PersonalSettingsRoute({ section }: PersonalSettingsRouteProps) {
  const router = useRouter()
  const { personalAccentColor } = usePersonalSettingsAccentColor()

  const onSectionChange = (nextSection: PersonalSettingsSection) => {
    router.push(`/settings/${nextSection}`)
  }

  let controller: (render: SettingsSectionRender) => ReactNode

  switch (section) {
    case "profile":
      controller = (render) => <ConnectedPersonalProfile render={render} />
      break
    case "preferences":
      controller = (render) => <ConnectedPersonalPreferences render={render} />
      break
    case "account":
      // The deletion entry UI requires no Section data Query.
      controller = (render) => render({ status: "ready", content: <Account /> })
      break
    case "usage":
      controller = (render) => <ConnectedPersonalUsage render={render} />
      break
  }

  const { label, errorTitle } = sectionStatusMessages[section]

  return (
    <PersonalSettingsView
      key={section}
      section={section}
      content={
        <SettingsSectionHost label={label} errorTitle={errorTitle}>
          {controller}
        </SettingsSectionHost>
      }
      personalAccentColor={personalAccentColor}
      onSectionChange={onSectionChange}
    />
  )
}

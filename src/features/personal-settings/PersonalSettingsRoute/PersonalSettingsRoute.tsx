"use client"

import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { SettingsSectionHost, type SettingsSectionRender } from "@/ui/SettingsSectionHost"
import { PersonalSettingsLayout } from "../PersonalSettingsLayout"
import type { PersonalSettingsSection } from "../personalSettingsSections"
import { Profile } from "../profile"
import { PersonalPreferences } from "../preferences"
import { PersonalUsage } from "../usage"
import { Account } from "../account"
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
export const PersonalSettingsRoute = ({ section }: PersonalSettingsRouteProps) => {
  const router = useRouter()
  const { personalAccentColor } = usePersonalSettingsAccentColor()

  const onSectionChange = (nextSection: PersonalSettingsSection) => {
    router.push(`/settings/${nextSection}`)
  }

  let controller: (render: SettingsSectionRender) => ReactNode

  switch (section) {
    case "profile":
      controller = (render) => <Profile render={render} />
      break
    case "preferences":
      controller = (render) => <PersonalPreferences render={render} />
      break
    case "account":
      // The deletion entry UI requires no Section data Query.
      controller = (render) => render({ status: "ready", content: <Account /> })
      break
    case "usage":
      controller = (render) => <PersonalUsage render={render} />
      break
  }

  const { label, errorTitle } = sectionStatusMessages[section]

  return (
    <PersonalSettingsLayout
      key={section}
      section={section}
      accentColor={personalAccentColor}
      onSectionChange={onSectionChange}
    >
      <SettingsSectionHost label={label} errorTitle={errorTitle}>
        {controller}
      </SettingsSectionHost>
    </PersonalSettingsLayout>
  )
}

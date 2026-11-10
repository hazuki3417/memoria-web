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
import { usePersonalSettingsReadState } from "./usePersonalSettingsReadState"

export type PersonalSettingsRouteProps = { section: PersonalSettingsSection }

/** Selects one Controller; the same Host governs every Section status. */
export function PersonalSettingsRoute({ section }: PersonalSettingsRouteProps) {
  const router = useRouter()
  const { personalAccentColor } = usePersonalSettingsReadState()

  const onSectionChange = (nextSection: PersonalSettingsSection) => {
    router.push(`/settings/${nextSection}`)
  }

  let controller: (render: SettingsSectionRender) => ReactNode
  let label = "Personal設定を読み込み中"
  let errorTitle: string | undefined

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
      label = "利用状況を読み込み中"
      errorTitle = "利用状況を取得できませんでした"
      controller = (render) => <ConnectedPersonalUsage render={render} />
      break
  }

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

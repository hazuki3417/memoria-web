"use client"

import { useRouter } from "next/navigation"
import type { PersonalSettingsSection } from "../personalSettingsSections"
import { ConnectedPersonalProfile } from "../profile/ConnectedPersonalProfile"
import { ConnectedPersonalPreferences } from "../preferences/ConnectedPersonalPreferences"
import { AccountUsageConnection } from "./AccountUsageConnection"

export type PersonalSettingsRouteProps = { section: PersonalSettingsSection }

/** Section選択とURL Navigationを構成し、接続固有の処理は所有者へ委譲する。 */
export function PersonalSettingsRoute(props: PersonalSettingsRouteProps) {
  const router = useRouter()
  const onSectionChange = (section: PersonalSettingsSection) => {
    router.push(`/settings/${section}`)
  }
  if (props.section === "profile") {
    return <ConnectedPersonalProfile onSectionChange={onSectionChange} />
  }
  if (props.section === "preferences") {
    return <ConnectedPersonalPreferences onSectionChange={onSectionChange} />
  }
  return (
    <AccountUsageConnection
      section={props.section}
      onSectionChange={onSectionChange}
    />
  )
}

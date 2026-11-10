"use client"

import { PersonalSettingsView } from "../PersonalSettingsView"
import { ConnectedPersonalUsage } from "../usage/ConnectedPersonalUsage"
import { Account } from "../account"
import type { PersonalSettingsSection } from "../personalSettingsSections"
import { usePersonalSettingsReadState } from "./usePersonalSettingsReadState"
import { usePersonalSettingsRefreshError } from "../usePersonalSettingsRefreshError"

type AccountUsageSection = Extract<PersonalSettingsSection, "account" | "usage">

/** AccountはCurrentUser状態を参照し、Usage固有の取得・LoadingはSection側が所有する。 */
export function AccountUsageConnection({
  section,
  onSectionChange,
}: {
  section: AccountUsageSection
  onSectionChange: (section: PersonalSettingsSection) => void
}) {
  const { data, error, personalAccentColor, loadState } =
    usePersonalSettingsReadState()
  usePersonalSettingsRefreshError(Boolean(data?.me && error))
  return (
    <PersonalSettingsView
      section={section}
      onSectionChange={onSectionChange}
      content={section === "usage" ? <ConnectedPersonalUsage /> : <Account />}
      loadState={section === "account" ? loadState : "ready"}
      personalAccentColor={personalAccentColor}
    />
  )
}

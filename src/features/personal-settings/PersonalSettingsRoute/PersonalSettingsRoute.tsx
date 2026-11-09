"use client"

import { useRouter } from "next/navigation"
import { PersonalSettingsView } from "../PersonalSettingsView"
import { ConnectedPersonalUsage } from "../usage/ConnectedPersonalUsage"
import type { PersonalSettingsSection } from "../personalSettingsSections"
import { fromGraphqlUserPreferences } from "../preferences/userPreferencesGraphqlAdapter"
import { usePersonalSettingsActions } from "./usePersonalSettingsActions"
import { usePersonalSettingsInspection } from "./usePersonalSettingsInspection"
import { usePersonalSettingsReadState } from "./usePersonalSettingsReadState"
import { usePersonalSettingsRefreshError } from "../usePersonalSettingsRefreshError"

type ProfilePreferencesSection = Extract<
  PersonalSettingsSection,
  "profile" | "preferences"
>
type AccountUsageSection = Extract<PersonalSettingsSection, "account" | "usage">

export type PersonalSettingsRouteProps =
  | { section: ProfilePreferencesSection }
  | { section: AccountUsageSection }

/** Personal設定のProduction接続入口。Section固有の取得・操作は個別の接続Componentが所有する。 */
export function PersonalSettingsRoute(props: PersonalSettingsRouteProps) {
  const router = useRouter()
  const onSectionChange = (section: PersonalSettingsSection) => {
    router.push(`/settings/${section}`)
  }
  if (props.section === "profile" || props.section === "preferences") {
    return (
      <ProfilePreferencesConnection
        section={props.section}
        onSectionChange={onSectionChange}
      />
    )
  }
  return (
    <AccountUsageConnection
      section={props.section}
      usageContent={props.section === "usage" ? <ConnectedPersonalUsage /> : undefined}
      onSectionChange={onSectionChange}
    />
  )
}

/** Profile/PreferencesはCurrentUserに加えて保存と結果確認を接続する。 */
function ProfilePreferencesConnection({
  section,
  onSectionChange,
}: {
  section: ProfilePreferencesSection
  onSectionChange: (section: PersonalSettingsSection) => void
}) {
  const { data, error, personalAccentColor, loadState } =
    usePersonalSettingsReadState()
  const { inspectProfile, inspectPreferences } = usePersonalSettingsInspection()
  usePersonalSettingsRefreshError(Boolean(data?.me && error))
  const { saveProfile, savePreferences } = usePersonalSettingsActions()
  const preferences = data?.me
    ? fromGraphqlUserPreferences(data.me.preferences)
    : undefined

  return (
    <PersonalSettingsView
      key={section}
      section={section}
      onSectionChange={onSectionChange}
      personalAccentColor={personalAccentColor}
      profileNickname={data?.me?.profile.nickname}
      loadState={loadState}
      initialPreferences={preferences}
      saveProfile={saveProfile}
      inspectProfile={inspectProfile}
      savePreferences={savePreferences}
      inspectPreferences={inspectPreferences}
    />
  )
}

/** AccountはCurrentUser状態を参照し、Usage固有の取得・LoadingはSection側が所有する。 */
function AccountUsageConnection({
  section,
  usageContent,
  onSectionChange,
}: {
  section: AccountUsageSection
  usageContent?: ReactNode
  onSectionChange: (section: PersonalSettingsSection) => void
}) {
  const { data, error, personalAccentColor, loadState } =
    usePersonalSettingsReadState()
  usePersonalSettingsRefreshError(Boolean(data?.me && error))
  return (
    <PersonalSettingsView
      section={section}
      onSectionChange={onSectionChange}
      usageContent={usageContent}
      loadState={section === "account" ? loadState : "ready"}
      personalAccentColor={personalAccentColor}
    />
  )
}

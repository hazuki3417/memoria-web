"use client"

import { useRouter } from "next/navigation"
import { useMediaQuery } from "@mantine/hooks"
import { PersonalSettingsView } from "../PersonalSettingsView"
import { ConnectedPersonalUsage } from "../usage/ConnectedPersonalUsage"
import { PersonalProfile } from "../profile"
import { PersonalPreferences } from "../preferences"
import { Account } from "../account"
import type { PersonalSettingsSection } from "../personalSettingsSections"
import { fromGraphqlUserPreferences } from "../preferences/userPreferencesGraphqlAdapter"
import { usePersonalSettingsActions } from "./usePersonalSettingsActions"
import { usePersonalSettingsInspection } from "./usePersonalSettingsInspection"
import { usePersonalSettingsReadState } from "./usePersonalSettingsReadState"
import { usePersonalSettingsRefreshError } from "../usePersonalSettingsRefreshError"

// Never simulate Production persistence when no save callback is available.
async function unavailableProfileSave(): Promise<void> {
  throw new Error("Profile save unavailable")
}

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
  const compact = useMediaQuery("(max-width: 48em)")
  const preferences = data?.me
    ? fromGraphqlUserPreferences(data.me.preferences)
    : undefined
  const content = section === "profile" ? (
    <PersonalProfile
      onSave={saveProfile ?? unavailableProfileSave}
      onInspect={inspectProfile}
      initialNickname={data?.me?.profile.nickname}
    />
  ) : (
    <PersonalPreferences
      compact={compact}
      initialPreferences={preferences}
      onSave={savePreferences}
      onInspect={inspectPreferences}
    />
  )

  return (
    <PersonalSettingsView
      key={section}
      section={section}
      onSectionChange={onSectionChange}
      personalAccentColor={personalAccentColor}
      loadState={loadState}
      content={content}
    />
  )
}

/** AccountはCurrentUser状態を参照し、Usage固有の取得・LoadingはSection側が所有する。 */
function AccountUsageConnection({
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

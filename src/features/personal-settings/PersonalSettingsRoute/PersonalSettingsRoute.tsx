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
import { usePersonalProfileSave } from "../profile/usePersonalProfileSave"
import { usePersonalPreferencesSave } from "../preferences/usePersonalPreferencesSave"
import { usePersonalSettingsInspection } from "./usePersonalSettingsInspection"
import { usePersonalSettingsReadState } from "./usePersonalSettingsReadState"
import { usePersonalSettingsRefreshError } from "../usePersonalSettingsRefreshError"

type AccountUsageSection = Extract<PersonalSettingsSection, "account" | "usage">

export type PersonalSettingsRouteProps = { section: PersonalSettingsSection }

/** Personal設定のProduction接続入口。Section固有の取得・操作は個別の接続Componentが所有する。 */
export function PersonalSettingsRoute(props: PersonalSettingsRouteProps) {
  const router = useRouter()
  const onSectionChange = (section: PersonalSettingsSection) => {
    router.push(`/settings/${section}`)
  }
  if (props.section === "profile") {
    return <ProfileConnection onSectionChange={onSectionChange} />
  }
  if (props.section === "preferences") {
    return <PreferencesConnection onSectionChange={onSectionChange} />
  }
  return (
    <AccountUsageConnection
      section={props.section}
      onSectionChange={onSectionChange}
    />
  )
}

/** Profile固有の保存・確認を接続する。共通CurrentUser取得とPreview解決は維持。 */
function ProfileConnection({
  onSectionChange,
}: {
  onSectionChange: (section: PersonalSettingsSection) => void
}) {
  const { data, error, personalAccentColor, loadState } =
    usePersonalSettingsReadState()
  const { inspectProfile } = usePersonalSettingsInspection()
  const { saveProfile } = usePersonalProfileSave()
  usePersonalSettingsRefreshError(Boolean(data?.me && error))

  return (
    <PersonalSettingsView
      key="profile"
      section="profile"
      onSectionChange={onSectionChange}
      personalAccentColor={personalAccentColor}
      loadState={loadState}
      content={
        <PersonalProfile
          onSave={saveProfile}
          onInspect={inspectProfile}
          initialNickname={data?.me?.profile.nickname}
        />
      }
    />
  )
}

/** Preferences固有の保存・確認・Viewport依存を接続する。 */
function PreferencesConnection({
  onSectionChange,
}: {
  onSectionChange: (section: PersonalSettingsSection) => void
}) {
  const { data, error, personalAccentColor, loadState } =
    usePersonalSettingsReadState()
  const { inspectPreferences } = usePersonalSettingsInspection()
  const { savePreferences } = usePersonalPreferencesSave()
  usePersonalSettingsRefreshError(Boolean(data?.me && error))
  const compact = useMediaQuery("(max-width: 48em)")
  const preferences = data?.me
    ? fromGraphqlUserPreferences(data.me.preferences)
    : undefined

  return (
    <PersonalSettingsView
      key="preferences"
      section="preferences"
      onSectionChange={onSectionChange}
      personalAccentColor={personalAccentColor}
      loadState={loadState}
      content={
        <PersonalPreferences
          compact={compact}
          initialPreferences={preferences}
          onSave={savePreferences}
          onInspect={inspectPreferences}
        />
      }
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

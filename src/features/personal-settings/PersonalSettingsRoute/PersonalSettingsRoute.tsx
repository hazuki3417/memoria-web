"use client"

import type { ReactNode } from "react"
import { PageStatusBoundary } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { PersonalSettings } from "../PersonalSettings"
import type { PersonalSettingsSection } from "../personalSettingsSections"
import { fromGraphqlUserPreferences } from "../preferences/userPreferencesGraphqlAdapter"
import { usePersonalSettingsActions } from "../usePersonalSettingsActions"
import { usePersonalSettingsInspection } from "../usePersonalSettingsInspection"
import { usePersonalSettingsReadState } from "../usePersonalSettingsReadState"
import { useSettingsRefreshError } from "../useSettingsRefreshError"

type EditableSection = Extract<PersonalSettingsSection, "profile" | "preferences">
type ReadOnlySection = Extract<PersonalSettingsSection, "account" | "usage">

export type PersonalSettingsRouteProps =
  | { section: EditableSection }
  | { section: ReadOnlySection; usageContent?: ReactNode }

/**
 * Production connection entry for Personal Settings.
 * Section-specific data/action requirements remain in their respective owners.
 */
export function PersonalSettingsRoute(props: PersonalSettingsRouteProps) {
  if (props.section === "profile" || props.section === "preferences") {
    return <EditablePersonalSettingsConnection section={props.section} />
  }
  return (
    <ReadOnlyPersonalSettingsConnection
      section={props.section}
      usageContent={props.usageContent}
    />
  )
}

/** Profile/Preferences require mutation and inspection in addition to CurrentUser. */
function EditablePersonalSettingsConnection({ section }: { section: EditableSection }) {
  const { data, error, personalAccentColor, loadState } =
    usePersonalSettingsReadState()
  const { inspectProfile, inspectPreferences } = usePersonalSettingsInspection()
  useSettingsRefreshError(Boolean(data?.me && error))
  const { saveProfile, savePreferences } = usePersonalSettingsActions()
  const preferences = data?.me
    ? fromGraphqlUserPreferences(data.me.preferences)
    : undefined

  return (
    <PersonalSettings
      key={section}
      section={section}
      personalAccentColor={personalAccentColor}
      profileNickname={data?.me?.profile.nickname}
      contentOverride={
        loadState !== "ready" ? (
          <PageStatusBoundary state={loadState} label="Personal設定を読み込み中">
            {null}
          </PageStatusBoundary>
        ) : undefined
      }
      initialPreferences={preferences}
      saveProfile={saveProfile}
      inspectProfile={inspectProfile}
      savePreferences={savePreferences}
      inspectPreferences={inspectPreferences}
    />
  )
}

/** Account uses CurrentUser status; Usage owns its own section data/loading. */
function ReadOnlyPersonalSettingsConnection({
  section,
  usageContent,
}: {
  section: ReadOnlySection
  usageContent?: ReactNode
}) {
  const { data, error, personalAccentColor, loadState } =
    usePersonalSettingsReadState()
  useSettingsRefreshError(Boolean(data?.me && error))
  const accountContent =
    section === "account" && loadState !== "ready" ? (
      <PageStatusBoundary state={loadState} label="Personal設定を読み込み中">
        {null}
      </PageStatusBoundary>
    ) : undefined

  return (
    <PersonalSettings
      section={section}
      usageContent={usageContent}
      accountContent={accountContent}
      personalAccentColor={personalAccentColor}
    />
  )
}

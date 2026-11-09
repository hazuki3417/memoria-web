"use client"

import { PersonalSettingsRoute } from "../PersonalSettingsRoute"

/** 既存Consumer向けの互換入口。Production PageはPersonalSettingsRouteを直接利用する。 */
export function ConnectedPersonalSettings({
  section,
}: {
  section: "profile" | "preferences"
}) {
  return <PersonalSettingsRoute section={section} />
}

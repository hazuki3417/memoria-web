"use client"

import { PersonalSettingsRoute } from "../PersonalSettingsRoute"

/** Compatibility entry; new production pages use PersonalSettingsRoute directly. */
export function ConnectedPersonalSettings({
  section,
}: {
  section: "profile" | "preferences"
}) {
  return <PersonalSettingsRoute section={section} />
}

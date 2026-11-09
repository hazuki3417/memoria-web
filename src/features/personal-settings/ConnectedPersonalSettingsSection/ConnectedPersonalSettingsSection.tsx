"use client"

import type { ReactNode } from "react"
import { PersonalSettingsRoute } from "../PersonalSettingsRoute"

/** Compatibility entry for Account/Usage section consumers. */
export function ConnectedPersonalSettingsSection({
  section,
  usageContent,
}: {
  section: "account" | "usage"
  usageContent?: ReactNode
}) {
  return <PersonalSettingsRoute section={section} usageContent={usageContent} />
}

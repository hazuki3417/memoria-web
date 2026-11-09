"use client"

import type { ReactNode } from "react"
import { PersonalSettingsRoute } from "../PersonalSettingsRoute"

/** Account/Usageの既存Consumer向け互換入口。 */
export function ConnectedPersonalSettingsSection({
  section,
  usageContent,
}: {
  section: "account" | "usage"
  usageContent?: ReactNode
}) {
  return <PersonalSettingsRoute section={section} usageContent={usageContent} />
}

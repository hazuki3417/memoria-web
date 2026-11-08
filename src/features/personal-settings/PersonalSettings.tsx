"use client"

import { useRouter } from "next/navigation"
import { PersonalSettingsView, type PersonalSettingsViewProps } from "./PersonalSettingsView"

/** Connects Personal Settings navigation to Next.js without owning its UI. */
export function PersonalSettings({
  section,
  ...props
}: Omit<PersonalSettingsViewProps, "onSectionChange">) {
  const router = useRouter()
  return (
    <PersonalSettingsView
      {...props}
      section={section}
      onSectionChange={(next) => router.push(`/settings/${next}`)}
    />
  )
}

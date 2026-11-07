"use client"

import { useRouter } from "next/navigation"
import { SettingsView, type SettingsViewProps } from "./SettingsView"

/** Connects Personal Settings navigation to Next.js without owning its UI. */
export function Settings({
  section,
  ...props
}: Omit<SettingsViewProps, "onSectionChange">) {
  const router = useRouter()
  return (
    <SettingsView
      {...props}
      section={section}
      onSectionChange={(next) => router.push(`/settings/${next}`)}
    />
  )
}

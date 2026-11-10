"use client"

import type { ReactNode } from "react"
import { SettingsContentStatus } from "@/components/SettingsContentStatus/SettingsContentStatus"

/** One state for the complete, active settings Section. */
export type SettingsSectionResult =
  | { status: "loading" }
  | { status: "error"; retry?: () => void }
  | { status: "ready"; content: ReactNode }

export type SettingsSectionRender = (result: SettingsSectionResult) => ReactNode

/** Keep the controller mounted while the ready-only UI is hidden. */
export function SettingsSectionHost({
  label,
  errorTitle,
  children,
}: {
  label: string
  errorTitle?: string
  children: (render: SettingsSectionRender) => ReactNode
}) {
  return (
    <>
      {children((result) => (
        <SettingsContentStatus
          state={result.status}
          label={label}
          errorTitle={errorTitle}
          onRetry={result.status === "error" ? result.retry : undefined}
        >
          {result.status === "ready" ? result.content : null}
        </SettingsContentStatus>
      ))}
    </>
  )
}

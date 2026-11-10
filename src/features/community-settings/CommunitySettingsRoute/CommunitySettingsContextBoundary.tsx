"use client"

import type { ReactNode } from "react"
import type { PageStatus } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { SettingsContentStatus } from "@/components/SettingsContentStatus/SettingsContentStatus"

/** Community共通Contextの取得状態を所有する。各Section固有の取得状態とは別境界。 */
export function CommunitySettingsContextBoundary({
  status,
  children,
}: {
  status: PageStatus
  children: ReactNode
}) {
  return (
    <SettingsContentStatus state={status} label="Community設定を読み込み中">
      {children}
    </SettingsContentStatus>
  )
}

"use client"

import { SettingsContentStatus } from "@/components/SettingsContentStatus/SettingsContentStatus"
import type { PageStatus } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { Account } from "./Account"

/** Accountは専用Connectionを設けず、共通CurrentUserの取得状態のみ受け取る。 */
export function PersonalAccountSection({ status }: { status: PageStatus }) {
  return (
    <SettingsContentStatus state={status} label="Personal設定を読み込み中">
      <Account />
    </SettingsContentStatus>
  )
}

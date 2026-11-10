"use client"

import { SettingsContentStatus } from "@/components/SettingsContentStatus/SettingsContentStatus"
import type { PageStatus } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { Usage } from "./Usage"
import type { FileSizeUnit } from "./formatFileSize"
import type { UsageData } from "./usageTypes"

/** Usage固有の取得状態表示と確定値UIを構成する。取得・Retry処理はConnectionが所有する。 */
export function UsageSection({
  scope,
  usage,
  status,
  fileSizeUnit,
  onRetry,
}: {
  scope: "personal" | "community"
  usage: UsageData
  status: PageStatus
  fileSizeUnit: FileSizeUnit
  onRetry: () => void
}) {
  return (
    <SettingsContentStatus
      state={status}
      label="利用状況を読み込み中"
      errorTitle="利用状況を取得できませんでした"
      onRetry={onRetry}
    >
      <Usage scope={scope} usage={usage} fileSizeUnit={fileSizeUnit} />
    </SettingsContentStatus>
  )
}

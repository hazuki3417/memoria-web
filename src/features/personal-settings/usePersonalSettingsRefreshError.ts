"use client"

import { useRisingEdge } from "@/ui/useRisingEdge"
import { showNotification } from "@/components/Feedback"

/** Report a failed background refresh only when previously loaded data remains usable. */
export function usePersonalSettingsRefreshError(failed: boolean) {
  useRisingEdge(failed, () => {
    showNotification({
      kind: "error",
      title: "設定の更新に失敗しました",
      description:
        "表示中の情報を維持しています。最新の情報はページを再読み込みして確認してください。",
    })
  })
}

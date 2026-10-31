"use client"

import { useEffect, useRef } from "react"
import { showNotification } from "@/components/Feedback"

/** Report a failed background refresh only when previously loaded data remains usable. */
export function useSettingsRefreshError(failed: boolean) {
  const wasFailed = useRef(false)
  useEffect(() => {
    if (failed && !wasFailed.current) {
      showNotification({
        kind: "error",
        title: "設定の更新に失敗しました",
        description: "表示中の情報を維持しています。最新の情報はページを再読み込みして確認してください。",
      })
    }
    wasFailed.current = failed
  }, [failed])
}

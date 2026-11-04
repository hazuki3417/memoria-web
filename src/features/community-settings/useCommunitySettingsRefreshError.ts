"use client"

import { useEffect, useRef } from "react"
import { showNotification } from "@/components/Feedback"

/** 取得済みのCommunity設定を保持したまま再取得が失敗した場合のみ通知する。 */
export function useCommunitySettingsRefreshError(failed: boolean) {
  const wasFailed = useRef(false)
  useEffect(() => {
    if (failed && !wasFailed.current) {
      showNotification({
        kind: "error",
        title: "設定の更新に失敗しました",
        description:
          "表示中の情報を維持しています。最新の情報はページを再読み込みして確認してください。",
      })
    }
    wasFailed.current = failed
  }, [failed])
}

"use client"

import { useState } from "react"
import { showNotification } from "@/components/Feedback"

/** Owns leave confirmation, pending state and failure feedback. */
export function useCommunityLeaveState({
  onLeave,
  onLeaveSuccess,
  blocked,
}: {
  onLeave?: () => Promise<void>
  onLeaveSuccess?: () => void
  blocked: boolean
}) {
  const [opened, setOpened] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const close = () => {
    if (!busy) {
      setOpened(false)
      setError("")
    }
  }
  const leave = async () => {
    if (!onLeave || blocked || busy) return
    setBusy(true)
    setError("")
    try {
      await onLeave()
    } catch {
      setError(
        "退会処理に失敗しました。現在の参加状況を確認して再試行してください。",
      )
      setBusy(false)
      return
    }
    // 退会の確定後は通知・遷移例外で失敗扱いに戻さない。
    setDone(true)
    setOpened(false)
    try {
      showNotification({
        kind: "success",
        title: "Communityを退会",
        description: "Communityから退会しました。",
      })
    } catch {
      // 通知の表示失敗はDashboard遷移を妨げない。
    }
    try {
      onLeaveSuccess?.()
    } catch {
      // 遷移失敗でも退会そのものは成立済み。
    } finally {
      setBusy(false)
    }
  }

  return { opened, setOpened, busy, error, done, close, leave }
}

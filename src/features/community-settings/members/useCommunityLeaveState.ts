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
      setDone(true)
      setOpened(false)
      showNotification({
        kind: "success",
        title: "Communityを退会",
        description: "Communityから退会しました。",
      })
      onLeaveSuccess?.()
    } catch {
      setError(
        "退会処理に失敗しました。現在の参加状況を確認して再試行してください。",
      )
    } finally {
      setBusy(false)
    }
  }

  return { opened, setOpened, busy, error, done, close, leave }
}

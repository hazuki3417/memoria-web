"use client"

import { useRef, useState } from "react"

/**
 * Group作成・編集・削除で共通の非同期操作ゲート。
 * 現行の単一busy状態、同期的な再入防止、成功/失敗結果を維持する。
 */
export function useGroupMutationAction() {
  const busyRef = useRef(false)
  const [saving, setSaving] = useState(false)

  const runAction = async (
    action: () => Promise<void>,
  ): Promise<"ok" | "busy" | "error"> => {
    if (busyRef.current) return "busy"
    busyRef.current = true
    setSaving(true)
    try {
      await action()
      return "ok"
    } catch {
      return "error"
    } finally {
      busyRef.current = false
      setSaving(false)
    }
  }

  return { saving, runAction }
}

"use client"

import { useState } from "react"
import { usePreferencesSave } from "./usePreferencesSave"
import {
  type UserPreferences,
  type UserPreferencesPatch,
} from "./userPreferences"

type SavePreferences = (patch: UserPreferencesPatch) => Promise<UserPreferences>

/**
 * Preferencesの選択値と保存Controllerの接続を担当する。
 * 保存失敗時も入力値を巻き戻さず、Queueに再試行対象を保持する。
 */
export function useUserPreferences(
  initialPreferences: UserPreferences,
  onSave?: SavePreferences,
) {
  const [preferences, setPreferences] =
    useState<UserPreferences>(initialPreferences)
  const [accentDraft, setAccentDraft] = useState(
    initialPreferences.personalAccentColor,
  )
  const { saveError, enqueue, retry } = usePreferencesSave(onSave)

  const change = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K],
  ) => {
    if (saveError === "blocked") return
    setPreferences((current) => ({ ...current, [key]: value }))
    enqueue({ [key]: value } as UserPreferencesPatch)
  }

  const changeAccentDraft = (value: string) => {
    setAccentDraft(value)
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      change("personalAccentColor", value.toUpperCase())
    }
  }

  return {
    preferences,
    accentDraft,
    change,
    changeAccentDraft,
    saveError,
    retry,
  }
}

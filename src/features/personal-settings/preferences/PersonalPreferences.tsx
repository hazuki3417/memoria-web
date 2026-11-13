"use client"

import { useUserPreferences } from "./useUserPreferences"
import { defaultUserPreferences, type UserPreferences, type UserPreferencesPatch } from "./userPreferences"
import { PersonalPreferencesView } from "./PersonalPreferencesView/PersonalPreferencesView"
import type { SavePersonalPreferencesAction } from "./save/preferencesSaveOutcome"

/** 環境設定のForm・Actionを接続し、既存Viewの表示と操作を保持する。 */
export function PersonalPreferences({
  compact,
  initialPreferences = defaultUserPreferences,
  onSave,
  onSaveAction,
  onInspect,
}: {
  compact: boolean
  initialPreferences?: UserPreferences
  onSave?: (patch: UserPreferencesPatch) => Promise<UserPreferences>
  onSaveAction?: SavePersonalPreferencesAction
  onInspect?: () => Promise<UserPreferences>
}) {
  const model = useUserPreferences(initialPreferences, onSave, onInspect, onSaveAction)
  return <PersonalPreferencesView compact={compact} model={model} canSave={Boolean(onSave || onSaveAction)} />
}

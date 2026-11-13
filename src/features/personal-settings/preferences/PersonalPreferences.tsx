"use client"

import { usePersonalPreferencesForm } from "./usePersonalPreferencesForm"
import { defaultUserPreferences, type UserPreferences, type UserPreferencesPatch } from "./userPreferences"
import { PersonalPreferencesView } from "./PersonalPreferencesView/PersonalPreferencesView"
import type { SavePersonalPreferencesAction } from "./PersonalPreferencesSave/personalPreferencesSaveOutcome"

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
  const model = usePersonalPreferencesForm(initialPreferences, onSave, onInspect, onSaveAction)
  return <PersonalPreferencesView compact={compact} model={model} canSave={Boolean(onSave || onSaveAction)} />
}

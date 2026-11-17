"use client"

import { PersonalPreferencesContent } from "./PersonalPreferencesContent"
import { usePersonalPreferencesForm } from "./usePersonalPreferencesForm"
import type { PersonalPreferencesValues } from "./personalPreferences"
import { defaultPersonalPreferences } from "./personalPreferences"
import type { PersonalPreferencesSaveOperations } from "./personalPreferencesSaveOutcome"

export type PersonalPreferencesViewProps = {
  compact?: boolean
  initialPreferences?: PersonalPreferencesValues
  operations: PersonalPreferencesSaveOperations
  sourceReady?: boolean
}

/** 本番のPreferences AutoSaveと表示Compositionを接続する。 */
export const PersonalPreferencesView = ({
  compact = false,
  initialPreferences = defaultPersonalPreferences,
  operations,
  sourceReady = true,
}: PersonalPreferencesViewProps) => {
  const model = usePersonalPreferencesForm(
    initialPreferences,
    undefined,
    operations.observe,
    operations.save,
    operations.confirm,
    operations.isAccentConfirmed,
    sourceReady,
  )
  return <PersonalPreferencesContent compact={compact} model={model} canSave />
}

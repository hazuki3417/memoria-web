"use client"

import { PersonalPreferencesContent } from "./PersonalPreferencesContent"
import { usePersonalPreferencesForm } from "./usePersonalPreferencesForm"
import { defaultPersonalPreferences, type PersonalPreferencesValues, type PersonalPreferencesPatch } from "./personalPreferences"
import type { PersonalPreferencesSaveOperations, SavePersonalPreferencesAction } from "./personalPreferencesSaveOutcome"

/** StoryとPrototypeで保存Outcome・Query値を差し込むための専用Adapter。 */
export const PersonalPreferencesStoryView = ({
  compact = false,
  initialPreferences = defaultPersonalPreferences,
  onSave,
  onSaveAction,
  onInspect,
  operations,
  sourceReady = true,
}: {
  compact?: boolean
  initialPreferences?: PersonalPreferencesValues
  onSave?: (patch: PersonalPreferencesPatch) => Promise<PersonalPreferencesValues>
  onSaveAction?: SavePersonalPreferencesAction
  onInspect?: () => Promise<PersonalPreferencesValues>
  operations?: PersonalPreferencesSaveOperations
  sourceReady?: boolean
}) => {
  const model = usePersonalPreferencesForm(
    initialPreferences, onSave, operations?.observe ?? onInspect,
    operations?.save ?? onSaveAction, operations?.confirm, operations?.isAccentConfirmed, sourceReady,
  )
  return (
    <PersonalPreferencesContent
      compact={compact}
      model={model}
      canSave={Boolean(operations || onSave || onSaveAction)}
    />
  )
}

"use client"

import { Stack } from "@mantine/core"
import { PageHeader } from "@/components/PageHeader"
import { SaveStatus, SETTINGS_SAVE_STATUS_TIMING } from "@/components/SaveStatus"
import { usePersonalPreferencesForm } from "./usePersonalPreferencesForm"
import { defaultPersonalPreferences, type PersonalPreferencesValues, type PersonalPreferencesPatch } from "./personalPreferences"
import type { PersonalPreferencesSaveOperations, SavePersonalPreferencesAction } from "./personalPreferencesSaveOutcome"
import { PersonalPreferencesSaveFeedback } from "./PersonalPreferencesSaveFeedback"
import { PersonalPreferencesDisplaySection } from "./PersonalPreferencesDisplaySection/PersonalPreferencesDisplaySection"
import { PersonalPreferencesPreviewSection } from "./PersonalPreferencesPreviewSection/PersonalPreferencesPreviewSection"

export type PersonalPreferencesViewProps = {
  compact?: boolean
  initialPreferences?: PersonalPreferencesValues
  onSave?: (patch: PersonalPreferencesPatch) => Promise<PersonalPreferencesValues>
  onSaveAction?: SavePersonalPreferencesAction
  onInspect?: () => Promise<PersonalPreferencesValues>
  operations?: PersonalPreferencesSaveOperations
}

/** 環境設定のHeader・Feedback・各Sectionを、保存処理から独立して描画する。 */
export function PersonalPreferencesView({
  compact = false,
  initialPreferences = defaultPersonalPreferences,
  onSave,
  onSaveAction,
  onInspect,
  operations,
}: PersonalPreferencesViewProps) {
  const model = usePersonalPreferencesForm(
    initialPreferences, onSave, operations?.observe ?? onInspect,
    operations?.save ?? onSaveAction, operations?.confirm, operations?.isAccentConfirmed,
  )
  const canSave = Boolean(operations || onSave || onSaveAction)
  return (
    <Stack gap="xl">
      <PageHeader
        title="環境設定"
        description="表示とプレビューの動作を設定します。"
        titleAccessory={
          canSave ? (
            <SaveStatus
              state={model.saveError ? "attention" : model.saveStatus}
              announce
              timing={SETTINGS_SAVE_STATUS_TIMING}
            />
          ) : undefined
        }
      />
      <PersonalPreferencesSaveFeedback model={model} />
      <PersonalPreferencesDisplaySection compact={compact} model={model} />
      <PersonalPreferencesPreviewSection compact={compact} model={model} />
    </Stack>
  )
}

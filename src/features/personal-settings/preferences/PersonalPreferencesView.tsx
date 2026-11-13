"use client"

import { Stack } from "@mantine/core"
import { PageHeader } from "@/components/PageHeader"
import { SaveStatus, SETTINGS_SAVE_STATUS_TIMING } from "@/components/SaveStatus"
import { usePersonalPreferencesForm } from "./usePersonalPreferencesForm"
import { defaultUserPreferences, type UserPreferences, type UserPreferencesPatch } from "./userPreferences"
import type { SavePersonalPreferencesAction } from "./personalPreferencesSaveOutcome"
import { PersonalPreferencesSaveFeedback } from "./PersonalPreferencesSaveFeedback"
import { PersonalPreferencesDisplaySection } from "./PersonalPreferencesDisplaySection/PersonalPreferencesDisplaySection"
import { PersonalPreferencesPreviewSection } from "./PersonalPreferencesPreviewSection/PersonalPreferencesPreviewSection"

export type PersonalPreferencesViewProps = {
  compact?: boolean
  initialPreferences?: UserPreferences
  onSave?: (patch: UserPreferencesPatch) => Promise<UserPreferences>
  onSaveAction?: SavePersonalPreferencesAction
  onInspect?: () => Promise<UserPreferences>
}

/** 環境設定のHeader・Feedback・各Sectionを、保存処理から独立して描画する。 */
export function PersonalPreferencesView({
  compact = false,
  initialPreferences = defaultUserPreferences,
  onSave,
  onSaveAction,
  onInspect,
}: PersonalPreferencesViewProps) {
  const model = usePersonalPreferencesForm(initialPreferences, onSave, onInspect, onSaveAction)
  const canSave = Boolean(onSave || onSaveAction)
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

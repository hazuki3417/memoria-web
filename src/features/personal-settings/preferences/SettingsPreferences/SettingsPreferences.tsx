"use client"

import { Stack } from "@mantine/core"
import { PageHeader } from "@/components/PageHeader"
import { SaveStatus, SETTINGS_SAVE_STATUS_TIMING } from "@/components/SaveStatus"
import { useUserPreferences } from "../useUserPreferences"
import { defaultUserPreferences, type UserPreferences, type UserPreferencesPatch } from "../userPreferences"
import { PersonalPreferencesSaveFeedback } from "./PersonalPreferencesSaveFeedback"
import { PersonalPreferencesDisplaySection } from "./PersonalPreferencesDisplaySection"
import { PersonalPreferencesPreviewSection } from "./PersonalPreferencesPreviewSection"

export function SettingsPreferences({
  compact,
  initialPreferences = defaultUserPreferences,
  onSave,
  onInspect,
}: {
  compact: boolean
  initialPreferences?: UserPreferences
  onSave?: (patch: UserPreferencesPatch) => Promise<UserPreferences>
  onInspect?: () => Promise<UserPreferences>
}) {
  const model = useUserPreferences(initialPreferences, onSave, onInspect)
  return (
    <Stack gap="xl">
      <PageHeader
        title="環境設定"
        description="表示とプレビューの動作を設定します。"
        titleAccessory={
          onSave ? (
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

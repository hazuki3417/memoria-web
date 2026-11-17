"use client"

import { Stack } from "@mantine/core"
import { PageHeader } from "@/components/PageHeader"
import { SaveStatus, SETTINGS_SAVE_STATUS_TIMING } from "@/components/SaveStatus"
import { PersonalPreferencesSaveFeedback } from "./PersonalPreferencesSaveFeedback"
import { PersonalPreferencesDisplaySection } from "./PersonalPreferencesDisplaySection/PersonalPreferencesDisplaySection"
import { PersonalPreferencesPreviewSection } from "./PersonalPreferencesPreviewSection/PersonalPreferencesPreviewSection"
import type { usePersonalPreferencesForm } from "./usePersonalPreferencesForm"

type PreferencesForm = ReturnType<typeof usePersonalPreferencesForm>

/** 共通のHeader / Feedback / Display / Preview表示を管理する。 */
export const PersonalPreferencesContent = ({
  compact,
  model,
  canSave,
}: {
  compact: boolean
  model: PreferencesForm
  canSave: boolean
}) => {
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

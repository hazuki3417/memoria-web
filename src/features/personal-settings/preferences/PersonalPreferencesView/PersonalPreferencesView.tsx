"use client"

import { Stack } from "@mantine/core"
import { PageHeader } from "@/components/PageHeader"
import { SaveStatus, SETTINGS_SAVE_STATUS_TIMING } from "@/components/SaveStatus"
import type { usePersonalPreferencesForm } from "../usePersonalPreferencesForm"
import { PersonalPreferencesSaveFeedback } from "../PersonalPreferencesSaveFeedback"
import { PersonalPreferencesDisplaySection } from "../PersonalPreferencesDisplaySection/PersonalPreferencesDisplaySection"
import { PersonalPreferencesPreviewSection } from "../PersonalPreferencesPreviewSection/PersonalPreferencesPreviewSection"

export type PersonalPreferencesViewProps = {
  compact: boolean
  model: ReturnType<typeof usePersonalPreferencesForm>
  canSave: boolean
}

/** 環境設定のHeader・Feedback・各Sectionを、保存処理から独立して描画する。 */
export function PersonalPreferencesView({ compact, model, canSave }: PersonalPreferencesViewProps) {
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

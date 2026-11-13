"use client"

import { useMantineColorScheme } from "@mantine/core"
import type { usePersonalPreferencesForm } from "../usePersonalPreferencesForm"

type PreferencesForm = ReturnType<typeof usePersonalPreferencesForm>

/** 表示Section固有のTheme操作と、共有Formから必要な設定操作を組み立てる。 */
export function usePersonalPreferencesDisplaySection(model: PreferencesForm) {
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const {
    preferences, accentDraft, accentOnBlur, accentDraftError,
    change, changeAccentDraft, fieldErrors,
  } = model
  return {
    colorScheme, setColorScheme,
    preferences, accentDraft, accentOnBlur, accentDraftError,
    change, changeAccentDraft, fieldErrors,
  }
}

export type PersonalPreferencesDisplaySectionModel =
  ReturnType<typeof usePersonalPreferencesDisplaySection>

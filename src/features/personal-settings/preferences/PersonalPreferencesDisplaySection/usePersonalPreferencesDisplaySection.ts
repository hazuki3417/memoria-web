"use client"

import { useMantineColorScheme } from "@mantine/core"
import type { usePersonalPreferencesForm } from "../usePersonalPreferencesForm"
import type { UserPreferences } from "../userPreferences"

type PreferencesForm = ReturnType<typeof usePersonalPreferencesForm>

/** 表示Section固有のTheme操作と、共有Formから必要な設定操作を組み立てる。 */
export function usePersonalPreferencesDisplaySection(model: PreferencesForm) {
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const {
    preferences, accentDraft, accentOnBlur, accentDraftError,
    change, changeAccentDraft, fieldErrors,
  } = model
  const changeTheme = (value: string | null) => {
    if (value) setColorScheme(value as "auto" | "light" | "dark")
  }
  const changeDateFormat = (value: string | null) => {
    if (value) change("dateFormat", value as UserPreferences["dateFormat"])
  }
  const changeFileSizeUnit = (value: string | null) => {
    if (value) change("fileSizeUnit", value as UserPreferences["fileSizeUnit"])
  }
  const changeThumbnailSize = (value: string | null) => {
    if (value) change("mediaThumbnailSize", value as UserPreferences["mediaThumbnailSize"])
  }
  return {
    colorScheme, changeTheme, changeDateFormat, changeFileSizeUnit, changeThumbnailSize,
    preferences, accentDraft, accentOnBlur, accentDraftError,
    change, changeAccentDraft, fieldErrors,
  }
}

export type PersonalPreferencesDisplaySectionModel =
  ReturnType<typeof usePersonalPreferencesDisplaySection>

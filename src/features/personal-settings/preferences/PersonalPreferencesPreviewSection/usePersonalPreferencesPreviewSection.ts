"use client"

import type { usePersonalPreferencesForm } from "../usePersonalPreferencesForm"

type PreferencesForm = ReturnType<typeof usePersonalPreferencesForm>

/** Preview Sectionが利用する値と操作だけを共有Formから投影する。 */
export function usePersonalPreferencesPreviewSection(model: PreferencesForm) {
  const { preferences, change, fieldErrors } = model
  return {
    preferences, fieldErrors,
    changeNavigationWrap: (checked: boolean) => change("mediaDetailNavigationWrap", checked),
    changeInitialInfoWide: (checked: boolean) => change("mediaDetailInitialInfoWide", checked),
    changeInitialInfoMedium: (checked: boolean) => change("mediaDetailInitialInfoMedium", checked),
  }
}

export type PersonalPreferencesPreviewSectionModel =
  ReturnType<typeof usePersonalPreferencesPreviewSection>

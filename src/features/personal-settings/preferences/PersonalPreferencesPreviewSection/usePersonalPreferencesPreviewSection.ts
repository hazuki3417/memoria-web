"use client"

import type { usePersonalPreferencesForm } from "../usePersonalPreferencesForm"

type PreferencesForm = ReturnType<typeof usePersonalPreferencesForm>

/** Preview Sectionが利用する値と操作だけを共有Formから投影する。 */
export function usePersonalPreferencesPreviewSection(model: PreferencesForm) {
  const { preferences, change, fieldErrors } = model
  return { preferences, change, fieldErrors }
}

export type PersonalPreferencesPreviewSectionModel =
  ReturnType<typeof usePersonalPreferencesPreviewSection>

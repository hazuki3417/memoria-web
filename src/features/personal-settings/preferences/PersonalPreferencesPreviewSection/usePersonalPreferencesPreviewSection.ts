"use client"

import type { usePersonalPreferencesForm } from "../usePersonalPreferencesForm"

export type PersonalPreferencesPreviewSectionInput = Pick<
  ReturnType<typeof usePersonalPreferencesForm>,
  "preferences" | "change" | "fieldErrors"
>

/** Preview Sectionが利用する値と操作だけを共有Formから投影する。 */
export function usePersonalPreferencesPreviewSection(model: PersonalPreferencesPreviewSectionInput) {
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

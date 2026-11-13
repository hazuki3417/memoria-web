"use client"

import type { usePersonalPreferencesForm } from "../usePersonalPreferencesForm"
import { usePersonalPreferencesPreviewSection } from "./usePersonalPreferencesPreviewSection"
import { PersonalPreferencesPreviewSectionView } from "./PersonalPreferencesPreviewSectionView"

type PreferencesForm = ReturnType<typeof usePersonalPreferencesForm>

/** Section固有の入力・操作をViewへ結合する。共有QueueとFormはページが所有する。 */
export function PersonalPreferencesPreviewSection({
  compact,
  model,
}: {
  compact: boolean
  model: PreferencesForm
}) {
  const sectionModel = usePersonalPreferencesPreviewSection(model)
  return <PersonalPreferencesPreviewSectionView compact={compact} model={sectionModel} />
}

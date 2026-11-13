"use client"

import type { usePersonalPreferencesForm } from "../usePersonalPreferencesForm"
import { usePersonalPreferencesDisplaySection } from "./usePersonalPreferencesDisplaySection"
import { PersonalPreferencesDisplaySectionView } from "./PersonalPreferencesDisplaySectionView"

type PreferencesForm = ReturnType<typeof usePersonalPreferencesForm>

/** Section固有の入力・操作をViewへ結合する。共有QueueとFormはページが所有する。 */
export function PersonalPreferencesDisplaySection({
  compact,
  model,
}: {
  compact: boolean
  model: PreferencesForm
}) {
  const sectionModel = usePersonalPreferencesDisplaySection(model)
  return <PersonalPreferencesDisplaySectionView compact={compact} model={sectionModel} />
}

"use client"

import { usePersonalPreferencesPreviewSection, type PersonalPreferencesPreviewSectionInput } from "./usePersonalPreferencesPreviewSection"
import { PersonalPreferencesPreviewSectionView } from "./PersonalPreferencesPreviewSectionView"

/** Section固有の入力・操作をViewへ結合する。共有QueueとFormはページが所有する。 */
export function PersonalPreferencesPreviewSection({
  compact,
  model,
}: {
  compact: boolean
  model: PersonalPreferencesPreviewSectionInput
}) {
  const sectionModel = usePersonalPreferencesPreviewSection(model)
  return <PersonalPreferencesPreviewSectionView compact={compact} model={sectionModel} />
}

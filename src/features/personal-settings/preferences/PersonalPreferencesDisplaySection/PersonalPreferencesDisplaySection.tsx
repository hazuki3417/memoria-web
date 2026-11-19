"use client"

import { usePersonalPreferencesDisplaySection, type PersonalPreferencesDisplaySectionInput } from "./usePersonalPreferencesDisplaySection"
import { PersonalPreferencesDisplaySectionView } from "./PersonalPreferencesDisplaySectionView"

/** Section固有の入力・操作をViewへ結合する。共有QueueとFormはページが所有する。 */
export function PersonalPreferencesDisplaySection({
  compact,
  model,
}: {
  compact: boolean
  model: PersonalPreferencesDisplaySectionInput
}) {
  const sectionModel = usePersonalPreferencesDisplaySection(model)
  return <PersonalPreferencesDisplaySectionView compact={compact} model={sectionModel} />
}

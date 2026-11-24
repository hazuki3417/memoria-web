"use client"

import { useCommunityPreferencesDisplaySection, type CommunityPreferencesDisplaySectionInput } from "./useCommunityPreferencesDisplaySection"
import { CommunityPreferencesDisplaySectionView } from "./CommunityPreferencesDisplaySectionView"

/** 表示Section固有の入力・操作をViewへ結合する。FormとQueueはPreferencesが所有する。 */
export const CommunityPreferencesDisplaySection = ({
  model,
  isPreview,
  accentError,
}: {
  model: CommunityPreferencesDisplaySectionInput
  isPreview: boolean
  accentError?: string
}) => {
  const sectionModel = useCommunityPreferencesDisplaySection(model, accentError)
  return <CommunityPreferencesDisplaySectionView model={sectionModel} isPreview={isPreview} />
}

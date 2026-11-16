"use client"

import type { useCommunityPreferencesForm } from "../useCommunityPreferencesForm"
import { useCommunityPreferencesDisplaySection } from "./useCommunityPreferencesDisplaySection"
import { CommunityPreferencesDisplaySectionView } from "./CommunityPreferencesDisplaySectionView"

/** 表示Section固有の入力・操作をViewへ結合する。FormとQueueはPreferencesが所有する。 */
export const CommunityPreferencesDisplaySection = ({
  model,
  isPreview,
  accentError,
}: {
  model: ReturnType<typeof useCommunityPreferencesForm>
  isPreview: boolean
  accentError?: string
}) => {
  const sectionModel = useCommunityPreferencesDisplaySection(model, accentError)
  return <CommunityPreferencesDisplaySectionView model={sectionModel} isPreview={isPreview} />
}

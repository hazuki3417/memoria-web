"use client"

import type { ComponentProps, Dispatch, ReactNode, SetStateAction } from "react"
import type { SaveStatusState } from "@/components/SaveStatus"
import { CommunityPreferencesContent } from "./CommunityPreferencesContent"
import { CommunityAliasSection } from "./CommunityAliasSection"
import { useCommunityPreferencesForm } from "./useCommunityPreferencesForm"
import type { CommunityPreferencesSaveOperations } from "./communityPreferencesSaveOutcome"
import type { CommunityPreferencesAccentPreview } from "./useCommunityPreferencesAutoSave"

/**
 * Story / Prototypeの入力・保存結果を注入するAdapter。
 * ProductionのView Propsへ疑似状態を持ち込まない。
 */
export const CommunityPreferencesStoryView = ({
  accent,
  initialDraft,
  onAccentDraftChange,
  setAccent,
  isPreview = true,
  restoreOnAccentChange = false,
  preserveDraftOnAccentChange = false,
  saveStatus,
  saveFeedback,
  accentError,
  onDraftValidityChange,
  aliasSection,
  alias,
  operations,
  preview,
  sourceReady = true,
}: {
  accent: string
  initialDraft?: string
  onAccentDraftChange?: (value: string) => void
  setAccent?: Dispatch<SetStateAction<string>>
  isPreview?: boolean
  restoreOnAccentChange?: boolean
  preserveDraftOnAccentChange?: boolean
  saveStatus?: SaveStatusState
  saveFeedback?: ReactNode
  accentError?: string
  onDraftValidityChange?: (valid: boolean) => void
  aliasSection?: ReactNode
  alias?: ComponentProps<typeof CommunityAliasSection>
  operations?: CommunityPreferencesSaveOperations
  preview?: CommunityPreferencesAccentPreview
  sourceReady?: boolean
}) => {
  const model = useCommunityPreferencesForm({
    accent, initialDraft, restoreOnAccentChange, preserveDraftOnAccentChange,
    saveStatus, onAccentDraftChange, onDraftValidityChange, setAccent,
    operations, preview, sourceReady,
  })
  return (
    <CommunityPreferencesContent
      model={model}
      aliasSection={aliasSection}
      alias={alias}
      isPreview={isPreview}
      saveFeedback={saveFeedback}
      accentError={accentError}
      productionLayout={Boolean(operations)}
    />
  )
}

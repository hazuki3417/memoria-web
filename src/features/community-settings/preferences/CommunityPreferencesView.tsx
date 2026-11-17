"use client"

import type { ComponentProps, Dispatch, ReactNode, SetStateAction } from "react"
import { Box, Stack } from "@mantine/core"
import { PageHeader } from "@/components/PageHeader"
import { SaveStatus, SETTINGS_SAVE_STATUS_TIMING, type SaveStatusState } from "@/components/SaveStatus"
import { SectionHeader } from "@/components/SectionHeader"
import { CommunityPreferencesDisplaySection } from "./CommunityPreferencesDisplaySection/CommunityPreferencesDisplaySection"
import { useCommunityPreferencesForm } from "./useCommunityPreferencesForm"
import { CommunityAliasSection } from "./CommunityAliasSection"
import { CommunityPreferencesSaveFeedback } from "./CommunityPreferencesSaveFeedback"
import type { CommunityPreferencesSaveOperations } from "./communityPreferencesSaveOutcome"
import type { CommunityPreferencesAccentPreview } from "./useCommunityPreferencesAutoSave"

/** Preferences全体のHeader・Feedback・Alias/AccentをCompositionする。 */
export const CommunityPreferencesView = ({
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

type PreferencesModel = ReturnType<typeof useCommunityPreferencesForm>

/**
 * Production / Story / Prototypeで同じVisual Compositionを共有する。
 * 保存・Query・PreviewのSource選択は呼び出し元とFormが所有する。
 */
const CommunityPreferencesContent = ({
  model,
  aliasSection,
  alias,
  isPreview,
  saveFeedback,
  accentError,
  productionLayout,
}: {
  model: PreferencesModel
  aliasSection?: ReactNode
  alias?: ComponentProps<typeof CommunityAliasSection>
  isPreview: boolean
  saveFeedback?: ReactNode
  accentError?: string
  productionLayout: boolean
}) => {
  const aliasContent = alias ? <CommunityAliasSection {...alias} /> : aliasSection
  const content = (
    <Stack gap="xl">
      <PageHeader
        title="環境設定"
        description="このCommunityでの自分専用の表示設定です。他のメンバーには影響しません。"
        titleAccessory={
          model.saveStatus !== undefined ? (
            <SaveStatus
              state={model.saveStatus}
              announce
              timing={SETTINGS_SAVE_STATUS_TIMING}
            />
          ) : undefined
        }
      />
      {saveFeedback ?? <CommunityPreferencesSaveFeedback model={model} />}
      {aliasContent && (
        <Box>
          <SectionHeader>表示名</SectionHeader>
          {aliasContent}
        </Box>
      )}
      <CommunityPreferencesDisplaySection
        model={model}
        isPreview={isPreview}
        accentError={accentError ?? model.snapshot.validation?.fieldErrors.accentColor}
      />
    </Stack>
  )
  // Productionの既存外側Stackを維持し、Preview Storyの外側構造を変更しない。
  return productionLayout ? <Stack gap="sm">{content}</Stack> : content
}

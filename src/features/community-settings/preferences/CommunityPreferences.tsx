"use client"

import type { Dispatch, ReactNode, SetStateAction } from "react"
import { Box, Stack } from "@mantine/core"
import { PageHeader } from "@/components/PageHeader"
import { SaveStatus, SETTINGS_SAVE_STATUS_TIMING, type SaveStatusState } from "@/components/SaveStatus"
import { SectionHeader } from "@/components/SectionHeader"
import { CommunityPreferencesDisplaySection } from "./CommunityPreferencesDisplaySection"
import { useCommunityPreferencesForm } from "./useCommunityPreferencesForm"

/** Preferences全体のHeader・Feedback・Alias/AccentをCompositionする。 */
export const CommunityPreferences = ({
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
}: {
  accent: string
  initialDraft?: string
  onAccentDraftChange?: (value: string) => void
  setAccent: Dispatch<SetStateAction<string>>
  isPreview?: boolean
  restoreOnAccentChange?: boolean
  preserveDraftOnAccentChange?: boolean
  saveStatus?: SaveStatusState
  saveFeedback?: ReactNode
  accentError?: string
  onDraftValidityChange?: (valid: boolean) => void
  aliasSection?: ReactNode
}) => {
  const model = useCommunityPreferencesForm({
    accent, initialDraft, restoreOnAccentChange, preserveDraftOnAccentChange,
    saveStatus, onAccentDraftChange, onDraftValidityChange, setAccent,
  })
  return (
    <Stack gap="xl">
      <PageHeader
        title="環境設定"
        description="このCommunityでの自分専用の表示設定です。他のメンバーには影響しません。"
        titleAccessory={
          saveStatus !== undefined ? (
            <SaveStatus
              state={saveStatus}
              announce
              timing={SETTINGS_SAVE_STATUS_TIMING}
            />
          ) : undefined
        }
      />
      {saveFeedback}
      {aliasSection && (
        <Box>
          <SectionHeader>表示名</SectionHeader>
          {aliasSection}
        </Box>
      )}
      <CommunityPreferencesDisplaySection
        model={model}
        isPreview={isPreview}
        accentError={accentError}
      />
    </Stack>
  )
}

"use client"

import { type Dispatch, type ReactNode, type SetStateAction } from "react"
import { Box, ColorInput, Stack, Text } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { PageHeader } from "@/components/PageHeader"
import { SaveStatus, SETTINGS_SAVE_STATUS_TIMING, type SaveStatusState } from "@/components/SaveStatus"
import { SectionHeader } from "@/components/SectionHeader"
import { SettingRow } from "@/components/SettingRow"
import { useCommunityAccentForm } from "./useCommunityAccentForm"

export function CommunityPreferencesContent({
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
  aliasControl,
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
  aliasControl?: ReactNode
}) {
  const compact = useMediaQuery("(max-width: 48em)")
  const { field, fieldState, draftInvalid, onDraftChange } = useCommunityAccentForm({
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
      {aliasControl && (
        <Box>
          <SectionHeader>表示名</SectionHeader>
          {aliasControl}
        </Box>
      )}
      <Box>
        <SectionHeader>表示</SectionHeader>
        <Stack gap="xl">
          <SettingRow
            compact={compact}
            label="Community Accent Color"
            description="このCommunityで使用するアクセントカラーを選びます。"
          >
            <ColorInput
              aria-label="Communityアクセントカラー"
              error={
                accentError ??
                (fieldState.isTouched &&
                draftInvalid
                  ? "HEXカラーコード（#RRGGBB）を入力してください。"
                  : undefined)
              }
              format="hex"
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              value={field.value}
              onChange={onDraftChange}
            />
          </SettingRow>
          {isPreview && (
            <Text size="sm" c="dimmed">
              色の選択はプレビューです。保存・Contextへの反映はまだ行われません。
            </Text>
          )}
        </Stack>
      </Box>
    </Stack>
  )
}

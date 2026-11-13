"use client"

import type { Dispatch, SetStateAction } from "react"
import { Box, ColorInput, Stack, Text } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { SectionHeader } from "@/components/SectionHeader"
import { SettingRow } from "@/components/SettingRow"
import type { SaveStatusState } from "@/components/SaveStatus"
import { useCommunityAccentForm } from "./useCommunityAccentForm"

/** Accent固有の入力・Validation・Responsive表示を所有する。 */
export function CommunityAccentSection({
  accent,
  initialDraft,
  onAccentDraftChange,
  setAccent,
  isPreview,
  restoreOnAccentChange,
  preserveDraftOnAccentChange,
  saveStatus,
  accentError,
  onDraftValidityChange,
}: {
  accent: string
  initialDraft?: string
  onAccentDraftChange?: (value: string) => void
  setAccent: Dispatch<SetStateAction<string>>
  isPreview: boolean
  restoreOnAccentChange: boolean
  preserveDraftOnAccentChange: boolean
  saveStatus?: SaveStatusState
  accentError?: string
  onDraftValidityChange?: (valid: boolean) => void
}) {
  const compact = useMediaQuery("(max-width: 48em)")
  const { field, fieldState, draftInvalid, onDraftChange } = useCommunityAccentForm({
    accent, initialDraft, restoreOnAccentChange, preserveDraftOnAccentChange,
    saveStatus, onAccentDraftChange, onDraftValidityChange, setAccent,
  })

  return (
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
  )
}

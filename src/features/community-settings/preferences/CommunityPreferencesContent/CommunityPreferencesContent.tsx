"use client"

import {
  useEffect,
  useRef,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react"
import { useController, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { communityAccentSchema } from "../communityAccentSchema"
import { Box, ColorInput, Stack, Text } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { PageHeader } from "@/components/PageHeader"
import { SaveStatus, SETTINGS_SAVE_STATUS_TIMING, type SaveStatusState } from "@/components/SaveStatus"
import { SectionHeader } from "@/components/SectionHeader"
import { SettingRow } from "@/components/SettingRow"

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
  const { control, getValues, reset } = useForm<
    z.input<typeof communityAccentSchema>
  >({
    resolver: zodResolver(communityAccentSchema),
    mode: "onChange",
    defaultValues: { accentDraft: initialDraft ?? accent },
  })
  const { field, fieldState } = useController({ control, name: "accentDraft" })

  // Refresh an untouched input; preserve an incomplete draft unless the
  // owning save controller explicitly restores its last confirmed value.
  const previousAccent = useRef(accent)
  const previousInitialDraft = useRef(initialDraft)
  useEffect(() => {
    const draft = getValues("accentDraft")
    const draftIsEdited =
      draft.toUpperCase() !== previousAccent.current.toUpperCase()
    previousAccent.current = accent
    if (
      !preserveDraftOnAccentChange &&
      (restoreOnAccentChange || !draftIsEdited)
    ) {
      reset({ accentDraft: accent })
    }
  }, [
    accent,
    restoreOnAccentChange,
    preserveDraftOnAccentChange,
    getValues,
    reset,
  ])

  // Explicit controller discard restores the input without remounting Alias controls.
  // Normal server refetch and pending input must not overwrite the live RHF Draft.
  useEffect(() => {
    if (
      initialDraft === undefined ||
      previousInitialDraft.current === initialDraft
    )
      return
    previousInitialDraft.current = initialDraft
    if (
      saveStatus === "idle" &&
      initialDraft.toUpperCase() === accent.toUpperCase()
    ) {
      reset({ accentDraft: initialDraft })
    }
  }, [initialDraft, saveStatus, accent, reset])

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
                !communityAccentSchema.safeParse({ accentDraft: field.value }).success
                  ? "HEXカラーコード（#RRGGBB）を入力してください。"
                  : undefined)
              }
              format="hex"
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              value={field.value}
              onChange={(next) => {
                field.onChange(next)
                onAccentDraftChange?.(next)
                const parsed = communityAccentSchema.safeParse({
                  accentDraft: next,
                })
                onDraftValidityChange?.(parsed.success)
                if (parsed.success) setAccent(parsed.data.accentDraft)
              }}
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

"use client"

import { Box, Button, Stack, TextInput } from "@mantine/core"
import { useEffect, useRef, useState } from "react"
import { useController, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { profileSchema } from "../profileSchema"
import { FeedbackAlert, showNotification } from "@/components/Feedback"
import { PageHeader } from "@/components/PageHeader"
import { SectionHeader } from "@/components/SectionHeader"

const MOCK_PROFILE = { nickname: "ユーザー" }

type ProfileSaveErrorKind = "retryable" | "blocked"
type ProfileSaveError = { kind: ProfileSaveErrorKind }
export type SaveProfile = (nickname: string) => Promise<void>

function isBlockingProfileSaveError(error: unknown): error is ProfileSaveError {
  return (
    typeof error === "object" &&
    error !== null &&
    "kind" in error &&
    error.kind === "blocked"
  )
}

export function SettingsProfile({
  onSave,
  initialNickname = MOCK_PROFILE.nickname,
  initialSaveState = "idle",
  blockedMessage = "Userの状態が変わったため、この画面での変更を続けられません。画面を再読み込みして現在の状態を確認してください。",
}: {
  onSave: SaveProfile
  initialNickname?: string
  initialSaveState?: "idle" | "saving" | "retryable-error" | "blocked"
  blockedMessage?: string
}) {
  const { control, reset, getValues, handleSubmit } = useForm<
    z.input<typeof profileSchema>,
    unknown,
    z.output<typeof profileSchema>
  >({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: { nickname: initialNickname },
  })
  const { field } = useController({ control, name: "nickname" })
  // The confirmed server value is not an editable Form Draft.
  const saved = useRef(initialNickname)
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "retryable-error" | "blocked"
  >(initialSaveState)
  // Update an untouched draft when the source nickname changes.
  const previousSourceNickname = useRef(initialNickname)
  useEffect(() => {
    if (previousSourceNickname.current === initialNickname) return
    previousSourceNickname.current = initialNickname
    const draftIsEdited = getValues("nickname").trim() !== saved.current
    saved.current = initialNickname
    if (!draftIsEdited && saveState !== "saving" && saveState !== "retryable-error") {
      reset({ nickname: initialNickname })
    }
  }, [initialNickname, getValues, reset, saveState])
  const validation = profileSchema.safeParse({ nickname: field.value })
  const normalized = field.value.trim()
  const dirty = normalized !== saved.current
  const invalid = !validation.success
  const isSaving = saveState === "saving"
  const isBlocked = saveState === "blocked"
  let saveLabel = "更新"
  if (saveState === "retryable-error") {
    saveLabel = "再試行"
  } else if (isSaving) {
    saveLabel = "更新中"
  }

  const save = handleSubmit(async ({ nickname }) => {
    if (!dirty || isSaving || isBlocked) return

    setSaveState("saving")
    try {
      await onSave(nickname)
      saved.current = nickname
      reset({ nickname })
      setSaveState("idle")
      showNotification({
        kind: "success",
        title: "プロフィールを保存",
        description: "プロフィールを更新しました。",
      })
    } catch (error) {
      setSaveState(
        isBlockingProfileSaveError(error) ? "blocked" : "retryable-error",
      )
    }
  })

  return (
    <Stack gap="xl">
      <PageHeader
        title="プロフィール"
        description="プロフィール情報を変更します。"
      />
      <Box>
        <SectionHeader>基本情報</SectionHeader>
        <Stack gap="md" maw={540}>
          {saveState === "retryable-error" && (
            <FeedbackAlert
              kind="error"
              title="保存の完了を確認できませんでした"
              role="alert"
            >
              入力内容は保持されています。内容を確認して、もう一度保存してください。
            </FeedbackAlert>
          )}
          {isBlocked && (
            <FeedbackAlert
              kind="error"
              title="プロフィールを変更できません"
              role="alert"
            >
              {blockedMessage}
            </FeedbackAlert>
          )}
          <TextInput
            label="ニックネーム"
            description="Memoriaで表示する名前です。"
            name={field.name}
            ref={field.ref}
            onBlur={field.onBlur}
            value={field.value}
            onChange={field.onChange}
            error={
              !validation.success ? validation.error.issues[0]?.message : undefined
            }
            required
            disabled={isSaving || isBlocked}
          />
          <Button
            size="sm"
            style={{ alignSelf: "flex-start" }}
            disabled={!dirty || invalid || isSaving || isBlocked}
            loading={isSaving}
            onClick={() => void save()}
          >
            {saveLabel}
          </Button>
        </Stack>
      </Box>
    </Stack>
  )
}

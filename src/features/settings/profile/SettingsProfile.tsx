"use client"

import { Box, Button, Stack, TextInput } from "@mantine/core"
import { useState } from "react"
import { FeedbackAlert, showNotification } from "@/components/Feedback"
import { PageHeader } from "@/components/PageHeader"
import { SectionHeader } from "@/components/SectionHeader"

const MOCK_PROFILE = { nickname: "ユーザー" }

type ProfileSaveErrorKind = "retryable" | "blocked"
type ProfileSaveError = { kind: ProfileSaveErrorKind }
export type SaveProfile = (nickname: string) => Promise<void>

async function saveMockProfile() {
  await new Promise((resolve) => setTimeout(resolve, 500))
}

function isBlockingProfileSaveError(error: unknown): error is ProfileSaveError {
  return (
    typeof error === "object" &&
    error !== null &&
    "kind" in error &&
    error.kind === "blocked"
  )
}

export function SettingsProfile({
  onSave = saveMockProfile,
  initialNickname = MOCK_PROFILE.nickname,
  initialSaveState = "idle",
  blockedMessage = "Userの状態が変わったため、この画面での変更を続けられません。画面を再読み込みして現在の状態を確認してください。",
}: {
  onSave?: SaveProfile
  initialNickname?: string
  initialSaveState?: "idle" | "saving" | "retryable-error" | "blocked"
  blockedMessage?: string
}) {
  const [name, setName] = useState(initialSaveState === "saving" || initialSaveState === "retryable-error" ? `${initialNickname}新` : initialNickname)
  const [saved, setSaved] = useState(initialNickname)
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "retryable-error" | "blocked"
  >(initialSaveState)
  const normalized = name.trim()
  const dirty = normalized !== saved
  const invalid = normalized.length === 0
  const isSaving = saveState === "saving"
  const isBlocked = saveState === "blocked"
  let saveLabel = "更新"
  if (saveState === "retryable-error") {
    saveLabel = "再試行"
  } else if (isSaving) {
    saveLabel = "更新中"
  }

  const save = async () => {
    if (!dirty || invalid || isSaving || isBlocked) return

    setSaveState("saving")
    try {
      await onSave(normalized)
      setSaved(normalized)
      setName(normalized)
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
  }

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
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            error={invalid ? "ニックネームを入力してください。" : undefined}
            required
            disabled={isSaving || isBlocked}
          />
          <Button
            size="sm"
            style={{ alignSelf: "flex-start" }}
            disabled={!dirty || invalid || isSaving || isBlocked}
            loading={isSaving}
            onClick={save}
          >
            {saveLabel}
          </Button>
        </Stack>
      </Box>
    </Stack>
  )
}


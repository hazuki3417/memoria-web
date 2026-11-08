"use client"

import { Box, Button, Stack, TextInput } from "@mantine/core"
import { PageHeader } from "@/components/PageHeader"
import { SectionHeader } from "@/components/SectionHeader"
import { useProfileForm } from "./useProfileForm"
import { ProfileSaveFeedback } from "./ProfileSaveFeedback"
import type { SaveProfile, InspectProfile } from "./useProfileForm"

export type { SaveProfile, InspectProfile } from "./useProfileForm"

const MOCK_PROFILE = { nickname: "ユーザー" }
const DEFAULT_BLOCKED_MESSAGE =
  "現在の状態では保存を続けられません。ページを再読み込みして、プロフィールの状態を確認してください。"

export function SettingsProfile({
  onSave,
  onInspect,
  initialNickname = MOCK_PROFILE.nickname,
  initialSaveState = "idle",
  blockedMessage = DEFAULT_BLOCKED_MESSAGE,
}: {
  onSave: SaveProfile
  onInspect?: InspectProfile
  initialNickname?: string
  initialSaveState?: "idle" | "saving" | "retryable-error" | "blocked"
  blockedMessage?: string
}) {
  const form = useProfileForm({
    onSave,
    onInspect,
    initialNickname,
    initialSaveState,
    blockedMessage,
  })
  const {
    field,
    fieldState,
    validation,
    normalized,
    dirty,
    invalid,
    showClientError,
    isSaving,
    isBlocked,
    isUnknown,
    canRetryInspected,
    saveLabel,
    saveState,
    formInvalid,
    blockedFeedback,
    inspection,
    save,
    inspectCurrentProfile,
    confirmObservedProfile,
    discardUnconfirmedDraft,
    onDraftChange,
  } = form

  return (
    <Stack gap="xl">
      <PageHeader
        title="プロフィール"
        description="プロフィール情報を変更します。"
      />
      <Box>
        <SectionHeader>基本情報</SectionHeader>
        <Stack gap="md" maw={540}>
          <ProfileSaveFeedback model={form} onInspect={onInspect} blockedMessage={blockedMessage} />
          <TextInput
            label="ニックネーム"
            description="Memoriaで表示する名前です。"
            name={field.name}
            ref={field.ref}
            onBlur={field.onBlur}
            value={field.value}
            onChange={onDraftChange}
            error={
              fieldState.error?.type === "server"
                ? fieldState.error.message
                : showClientError && !validation.success
                  ? validation.error.issues[0]?.message
                  : undefined
            }
            required
            disabled={isSaving || isBlocked}
          />
          <Button
            size="sm"
            style={{ alignSelf: "flex-start" }}
            disabled={!dirty || invalid || isSaving || isBlocked || isUnknown}
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

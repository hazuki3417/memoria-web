"use client"

import { Box, Button, Stack, TextInput } from "@mantine/core"
import { PageHeader } from "@/components/PageHeader"
import { SectionHeader } from "@/components/SectionHeader"
import { ProfileSaveFeedback } from "./ProfileSaveFeedback"
import { useProfileForm, type InspectProfile } from "./useProfileForm"
import type { SaveProfile } from "./profileSaveOutcome"

const blockedDescription =
  "現在の状態では保存を続けられません。ページを再読み込みして、プロフィールの状態を確認してください。"

/** 利用者がNicknameを編集・保存し、保存失敗や結果不明時の案内と復旧操作を利用できる画面を提供する。 */
export const ProfileView = ({
  onSave,
  onInspect,
  initialNickname = "ユーザー",
  initialSaveState = "idle",
  blockedMessage = blockedDescription,
}: {
  onSave: SaveProfile
  onInspect?: InspectProfile
  initialNickname?: string
  initialSaveState?: "idle" | "saving" | "retryable-error" | "blocked"
  blockedMessage?: string
}) => {
  const form = useProfileForm({
    onSave,
    onInspect,
    initialNickname,
    initialSaveState,
    blockedMessage,
  })

  const { field, fieldState, validation } = form
  const error =
    fieldState.error?.type === "server"
      ? fieldState.error.message
      : form.showClientError && !validation.success
        ? validation.error.issues[0]?.message
        : undefined

  return (
    <Stack gap="xl">
      <PageHeader
        title="プロフィール"
        description="プロフィール情報を変更します。"
      />
      <Box>
        <SectionHeader>基本情報</SectionHeader>
        <Stack gap="md" maw={540}>
          <ProfileSaveFeedback
            model={form}
            onInspect={onInspect}
            blockedMessage={blockedMessage}
          />
          <TextInput
            label="ニックネーム"
            description="Memoriaで表示する名前です。"
            required
            name={field.name}
            ref={field.ref}
            onBlur={field.onBlur}
            value={field.value}
            onChange={form.onDraftChange}
            error={error}
            disabled={form.saving || form.blocked}
          />
          <Button
            size="sm"
            style={{ alignSelf: "flex-start" }}
            disabled={!form.dirty || form.invalid || form.saving || form.blocked || form.unknown}
            loading={form.saving}
            onClick={() => void form.save()}
          >
            {form.saveLabel}
          </Button>
        </Stack>
      </Box>
    </Stack>
  )
}

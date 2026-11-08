"use client"

import { Box, Button, Stack, TextInput } from "@mantine/core"
import { FeedbackPanel } from "@/components/Feedback"
import { PageHeader } from "@/components/PageHeader"
import { SectionHeader } from "@/components/SectionHeader"
import { useProfileForm } from "./useProfileForm"
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
  } = useProfileForm({
    onSave,
    onInspect,
    initialNickname,
    initialSaveState,
    blockedMessage,
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
            <FeedbackPanel
              kind="error"
              title="プロフィールを保存できませんでした"
              role="alert"
            >
              入力した名前は保持しています。下の「再試行」ボタンからもう一度保存できます。
            </FeedbackPanel>
          )}
          {formInvalid && (
            <FeedbackPanel
              kind="error"
              title="入力内容を確認してください"
              role="alert"
            >
              入力した値を受け付けられませんでした。内容を見直して、もう一度保存してください。
              編集しただけでは問題が解消したとは限りません。
            </FeedbackPanel>
          )}
          {isUnknown && (
            <FeedbackPanel
              kind="warning"
              title="プロフィールの保存結果を確認できませんでした"
              role="alert"
              actions={
                onInspect ? (
                  <>
                    <Button
                      size="xs"
                      variant="light"
                      loading={inspection.status === "checking"}
                      onClick={() => void inspectCurrentProfile()}
                    >
                      {inspection.status === "idle" ||
                      inspection.status === "failed" ||
                      inspection.status === "checking"
                        ? "現在の状態を確認"
                        : "もう一度確認"}
                    </Button>
                    {inspection.status === "matches" && (
                      <Button size="xs" onClick={confirmObservedProfile}>
                        確認完了
                      </Button>
                    )}
                    {inspection.status === "differs" && (
                      <>
                        <Button
                          size="xs"
                          disabled={!canRetryInspected}
                          onClick={() => void save()}
                        >
                          もう一度保存
                        </Button>
                        <Button
                          size="xs"
                          variant="subtle"
                          color="gray"
                          onClick={discardUnconfirmedDraft}
                        >
                          変更を破棄
                        </Button>
                      </>
                    )}
                  </>
                ) : undefined
              }
            >
              <Stack gap="xs">
                <span>
                  入力した名前は保持しています。前の保存が成功したかは分からないため、自動で再送しません。
                </span>
                {inspection.status === "matches" && (
                  <span>
                    現在のプロフィールは入力内容と一致しています。元の保存処理が成功した証明ではありません。内容を確認した場合は「確認完了」を選んでください。
                  </span>
                )}
                {inspection.status === "differs" && (
                  <span>
                    現在のニックネームは「{inspection.nickname}」です。入力内容の「{normalized}」とは異なります。必要な場合だけ、もう一度保存するか、変更を破棄してください。
                  </span>
                )}
                {inspection.status === "failed" && (
                  <span>
                    現在のプロフィールを取得できませんでした。保存操作は再送せず、状態の確認をやり直してください。
                  </span>
                )}
                {!onInspect && (
                  <span>
                    この画面では現在の状態を照会できません。入力内容を控えてから画面を再読み込みしてください。
                  </span>
                )}
              </Stack>
            </FeedbackPanel>
          )}
          {isBlocked && (
            <FeedbackPanel
              kind="error"
              title={blockedFeedback?.title ?? "プロフィールを変更できません"}
              role="alert"
            >
              {blockedFeedback?.description ?? blockedMessage}
            </FeedbackPanel>
          )}
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

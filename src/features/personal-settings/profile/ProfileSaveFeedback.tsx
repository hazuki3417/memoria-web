"use client"

import { Button, Stack } from "@mantine/core"
import { FeedbackPanel } from "@/components/Feedback"
import type { useProfileForm } from "./useProfileForm"

type FormModel = ReturnType<typeof useProfileForm>

/** Renders Profile save failures and explicit resolution actions. */
export function ProfileSaveFeedback({
  model,
  onInspect,
  blockedMessage,
}: {
  model: FormModel
  onInspect?: () => Promise<string>
  blockedMessage: string
}) {
  const {
    saveState,
    formInvalid,
    isUnknown,
    inspection,
    inspectCurrentProfile,
    confirmObservedProfile,
    canRetryInspected,
    save,
    discardUnconfirmedDraft,
    normalized,
    isBlocked,
    blockedFeedback,
  } = model

  return (
    <>
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
    </>
  )
}

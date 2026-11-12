"use client"

import { ExplicitSaveRecoveryActions } from "@/ui/ExplicitSave"
import { FeedbackPanel } from "@/components/Feedback"
import type { useCommunityAliasForm } from "./useCommunityAliasForm"

type AliasForm = ReturnType<typeof useCommunityAliasForm>

/** Save failure and unknown-outcome recovery feedback for Community Alias. */
export function CommunityAliasSaveFeedback({
  model,
  onInspect,
}: {
  model: AliasForm
  onInspect?: () => Promise<string | null>
}) {
  const {
    failure, formInvalid, blockedFeedback, inspection,
    inspect, canResaveInspected, confirmObservation, discardUnconfirmed,
    normalized, save,
  } = model
  return (
    <>
      {(failure || formInvalid) && (
        <FeedbackPanel
          kind={failure === "unknown" ? "warning" : "error"}
          role="alert"
          title={
            failure === "unknown"
              ? "保存結果を確認できませんでした"
              : failure === "blocked"
                ? blockedFeedback?.title ?? "Community別名を変更できません"
                : formInvalid
                  ? "入力内容を確認してください"
                  : "保存できませんでした"
          }
          actions={
            failure === "unknown" && onInspect ? (
              <ExplicitSaveRecoveryActions
                inspectionStatus={inspection.status}
                onInspect={inspect}
                onConfirm={confirmObservation}
                onResave={save}
                onDiscard={discardUnconfirmed}
                canResave={canResaveInspected}
              />
            ) : undefined
          }
        >
          {failure === "unknown"
            ? inspection.status === "matches"
              ? "現在のCommunity別名は入力内容と一致しています。元の保存処理が成功した証明ではありません。確認した場合は「確認完了」を選んでください。"
              : inspection.status === "differs"
                ? `現在のCommunity別名は「${inspection.alias ?? "設定なし"}」です。入力した「${normalized || "設定なし"}」とは異なります。必要な場合だけもう一度保存するか変更を破棄してください。`
                : inspection.status === "failed"
                  ? "現在のCommunity別名を取得できませんでした。保存を再送せず、状態の確認をやり直してください。"
                  : onInspect
                    ? "入力内容を保持しています。保存結果は未確定です。現在の状態を確認してから復旧操作を選んでください。"
                    : "入力内容を保持しています。保存結果は未確定です。入力内容を控えてから再読み込みしてください。"
            : failure === "blocked"
              ? blockedFeedback?.description ?? "入力内容を保持しています。権限とアカウントの状態を確認してください。"
              : formInvalid
                ? "入力した値を受け付けられませんでした。内容を見直して、もう一度保存してください。"
                : "入力内容を保持しています。再度保存してください。"}
        </FeedbackPanel>
      )}
    </>
  )
}

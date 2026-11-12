import type { useProfileForm } from "./useProfileForm"

type FormModel = ReturnType<typeof useProfileForm>

export type ProfileFeedbackSection = {
  id: "retryable" | "validation" | "unknown" | "blocked"
  kind: "error" | "warning"
  title: string
  description: string
  details?: ReadonlyArray<string>
}

/**
 * Pure presentation decision for Profile.
 * Multiple simultaneous panels are preserved from the existing UI contract.
 */
export function resolveProfileSaveFeedback({
  failure,
  formInvalid,
  blockedFeedback,
  inspection,
  normalized,
  blockedMessage,
  hasInspector,
}: Pick<
  FormModel,
  | "failure"
  | "formInvalid"
  | "blockedFeedback"
  | "inspection"
  | "normalized"
> & {
  blockedMessage: string
  hasInspector: boolean
}): ProfileFeedbackSection[] {
  const feedback: ProfileFeedbackSection[] = []

  if (failure === "retryable") {
    feedback.push({
      id: "retryable",
      kind: "error",
      title: "プロフィールを保存できませんでした",
      description:
        "入力した名前は保持しています。下の「再試行」ボタンからもう一度保存できます。",
    })
  }

  if (formInvalid) {
    feedback.push({
      id: "validation",
      kind: "error",
      title: "入力内容を確認してください",
      description:
        "入力した値を受け付けられませんでした。内容を見直して、もう一度保存してください。 編集しただけでは問題が解消したとは限りません。",
    })
  }

  if (failure === "unknown") {
    const details: string[] = []

    if (inspection.status === "matches") {
      details.push(
        "現在のプロフィールは入力内容と一致しています。元の保存処理が成功した証明ではありません。内容を確認した場合は「確認完了」を選んでください。",
      )
    }
    if (inspection.status === "differs") {
      details.push(
        `現在のニックネームは「${inspection.value}」です。入力内容の「${normalized}」とは異なります。必要な場合だけ、もう一度保存するか、変更を破棄してください。`,
      )
    }
    if (inspection.status === "failed") {
      details.push(
        "現在のプロフィールを取得できませんでした。保存操作は再送せず、状態の確認をやり直してください。",
      )
    }
    if (!hasInspector) {
      details.push(
        "この画面では現在の状態を照会できません。入力内容を控えてから画面を再読み込みしてください。",
      )
    }

    feedback.push({
      id: "unknown",
      kind: "warning",
      title: "プロフィールの保存結果を確認できませんでした",
      description:
        "入力した名前は保持しています。前の保存が成功したかは分からないため、自動で再送しません。",
      details,
    })
  }

  if (failure === "blocked") {
    feedback.push({
      id: "blocked",
      kind: "error",
      title: blockedFeedback?.title ?? "プロフィールを変更できません",
      description: blockedFeedback?.description ?? blockedMessage,
    })
  }

  return feedback
}

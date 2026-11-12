import type { useProfileForm } from "./useProfileForm"

type ProfileForm = ReturnType<typeof useProfileForm>
type ProfileFeedbackInput = Pick<ProfileForm, "status" | "formInvalid" | "inspection" | "normalized"> & {
  canInspect: boolean
  blockedMessage: string
}

export type ProfileFeedbackItem = {
  id: "retryable" | "validation" | "unknown" | "blocked"
  kind: "error" | "warning"
  title: string
  description: string
  details?: readonly string[]
}

const messages = {
  retryable: {
    kind: "error",
    title: "プロフィールを保存できませんでした",
    description: "入力した名前は保持しています。下の「再試行」ボタンからもう一度保存できます。",
  },
  validation: {
    kind: "error",
    title: "入力内容を確認してください",
    description: "入力した値を受け付けられませんでした。内容を見直して、もう一度保存してください。編集しただけでは問題が解消したとは限りません。",
  },
  unknown: {
    kind: "warning",
    title: "プロフィールの保存結果を確認できませんでした",
    description: "入力した名前は保持しています。前の保存が成功したかは分からないため、自動で再送しません。",
  },
} as const satisfies Record<"retryable" | "validation" | "unknown", Pick<ProfileFeedbackItem, "kind" | "title" | "description">>

/** 保存状態・入力検証・現状照会に応じた案内を、表示順序を保つFeedback一覧として提供する。 */
export const getProfileSaveFeedback = ({
  status,
  formInvalid,
  inspection,
  normalized,
  canInspect,
  blockedMessage,
}: ProfileFeedbackInput): ProfileFeedbackItem[] => {
  const items: ProfileFeedbackItem[] = []

  if (status.kind === "retryable-error") {
    items.push({ id: "retryable", ...messages.retryable })
  }

  if (formInvalid) {
    items.push({ id: "validation", ...messages.validation })
  }

  if (status.kind === "unknown") {
    const details: string[] = []
    if (inspection.kind === "matches") {
      details.push("現在のプロフィールは入力内容と一致しています。元の保存処理が成功した証明ではありません。内容を確認した場合は「確認完了」を選んでください。")
    }
    if (inspection.kind === "differs") {
      details.push(`現在のニックネームは「${inspection.value}」です。入力内容の「${normalized}」とは異なります。必要な場合だけ、もう一度保存するか、変更を破棄してください。`)
    }
    if (inspection.kind === "failed") {
      details.push("現在のプロフィールを取得できませんでした。保存操作は再送せず、状態の確認をやり直してください。")
    }
    if (!canInspect) {
      details.push("この画面では現在の状態を照会できません。入力内容を控えてから画面を再読み込みしてください。")
    }
    items.push({ id: "unknown", ...messages.unknown, details })
  }

  if (status.kind === "blocked") {
    items.push({
      id: "blocked",
      kind: "error",
      title: status.feedback.title,
      description: status.feedback.description || blockedMessage,
    })
  }

  return items
}

import {
  resolveSaveFeedback,
  type SaveFeedback,
  type SaveFeedbackMessages,
  type SaveFeedbackType,
} from "@/ui/save-feedback"

type Inspection =
  | { status: "idle" | "checking" | "failed" }
  | { status: "matches" | "differs"; alias: string | null }

type FeedbackInput = {
  failure: "retryable" | "blocked" | "unknown" | null
  formInvalid: boolean
  blockedFeedback: { title: string; description: string } | null
  inspection: Inspection
  normalized: string
  hasInspection: boolean
}

const messages = {
  validation: {
    title: "入力内容を確認してください",
    description: "入力した値を受け付けられませんでした。内容を見直して、もう一度保存してください。",
  },
  retryable: {
    title: "保存できませんでした",
    description: "入力内容を保持しています。再度保存してください。",
  },
  unknown: {
    title: "保存結果を確認できませんでした",
    description: "入力内容を保持しています。保存結果は未確定です。現在の状態を確認してから復旧操作を選んでください。",
  },
  blocked: {
    title: "Community別名を変更できません",
    description: "入力内容を保持しています。権限とアカウントの状態を確認してください。",
  },
} satisfies SaveFeedbackMessages

/** 保存失敗の優先順位と現在値照会の説明を、単一Feedbackへ解決する。 */
export const resolveCommunityAliasSaveFeedback = ({
  failure,
  formInvalid,
  blockedFeedback,
  inspection,
  normalized,
  hasInspection,
}: FeedbackInput): SaveFeedback | null => {
  const type: SaveFeedbackType | null =
    failure === "unknown" ? "unknown"
    : failure === "blocked" ? "blocked"
    : formInvalid ? "validation"
    : failure === "retryable" ? "retryable"
    : null
  const feedback = resolveSaveFeedback(type, messages)
  if (!feedback) return null
  if (feedback.type === "blocked") {
    return { ...feedback, ...(blockedFeedback ?? {}) }
  }
  if (feedback.type !== "unknown") return feedback

  const description =
    inspection.status === "matches"
      ? "現在のCommunity別名は入力内容と一致しています。元の保存処理が成功した証明ではありません。確認した場合は「確認完了」を選んでください。"
    : inspection.status === "differs"
      ? `現在のCommunity別名は「${inspection.alias ?? "設定なし"}」です。入力した「${normalized || "設定なし"}」とは異なります。必要な場合だけもう一度保存するか変更を破棄してください。`
    : inspection.status === "failed"
      ? "現在のCommunity別名を取得できませんでした。保存を再送せず、状態の確認をやり直してください。"
    : hasInspection
      ? messages.unknown.description
      : "入力内容を保持しています。保存結果は未確定です。入力内容を控えてから再読み込みしてください。"

  return { ...feedback, description }
}

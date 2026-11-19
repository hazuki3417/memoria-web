import {
  resolveSaveFeedback,
  type SaveFeedback,
  type SaveFeedbackMessages,
  type SaveFeedbackType,
} from "@/ui/save-feedback"

type FeedbackInput = {
  failure: "retryable" | "blocked" | "unknown" | null
  formInvalid: boolean
  blockedFeedback: { title: string; description: string } | null
}

const messages = {
  validation: {
    title: "入力内容を確認してください",
    description: "入力した値を受け付けられませんでした。内容を見直して、もう一度保存してください。",
  },
  retryable: {
    title: "保存できませんでした",
    description: "入力内容を保持しています。もう一度保存してください。",
  },
  unknown: {
    title: "保存結果を確認できませんでした",
    description: "保存されたか確認できません。自動で再送しません。ページを再読み込みして状態を確認してください。",
  },
  blocked: {
    title: "Community別名を変更できません",
    description: "入力内容を保持しています。権限とアカウントの状態を確認してください。",
  },
} satisfies SaveFeedbackMessages

/** 保存結果の意味からFeedbackを導出し、Blocked原因の案内を維持する。 */
export const resolveCommunityAliasSaveFeedback = ({
  failure,
  formInvalid,
  blockedFeedback,
}: FeedbackInput): SaveFeedback | null => {
  const type: SaveFeedbackType | null =
    failure === "unknown" ? "unknown"
    : failure === "blocked" ? "blocked"
    : formInvalid ? "validation"
    : failure === "retryable" ? "retryable"
    : null
  const feedback = resolveSaveFeedback(type, messages)
  if (!feedback) return null
  return feedback.type === "blocked"
    ? { ...feedback, ...(blockedFeedback ?? {}) }
    : feedback
}

import { resolveSaveFeedback, type SaveFeedback, type SaveFeedbackMessages, type SaveFeedbackType } from "@/ui/save-feedback"
import type { useProfileForm } from "./useProfileForm"

type ProfileForm = ReturnType<typeof useProfileForm>
type ProfileFeedbackInput = Pick<ProfileForm, "status" | "formInvalid" | "inspection" | "normalized"> & {
  canInspect: boolean
  blockedMessage: string
}

const messages = {
  validation: {
    title: "入力内容を確認してください",
    description: "入力した内容を確認して、もう一度保存してください。",
  },
  retryable: {
    title: "プロフィールを保存できませんでした",
    description: "入力内容は保持しています。下の「再試行」からもう一度保存できます。",
  },
  unknown: {
    title: "プロフィールの保存結果を確認できませんでした",
    description: "入力内容は保持しています。保存結果が不明なため、自動で再送しません。現在の状態を確認してください。",
  },
  blocked: {
    title: "プロフィールを変更できません",
    description: "ページを再読み込みして現在の状態を確認してください。",
  },
} satisfies SaveFeedbackMessages

/** Profileの保存状態から利用者に必要な案内を一件だけ選び、照会結果に応じた説明を補う。 */
export const getProfileSaveFeedback = ({
  status,
  formInvalid,
  inspection,
  normalized,
  canInspect,
  blockedMessage,
}: ProfileFeedbackInput): SaveFeedback | null => {
  // 保存結果が不明・保存不可の場合は、その安全な復旧案内を入力エラーより優先する。
  const type: SaveFeedbackType | null =
    status.kind === "blocked" ? "blocked"
    : status.kind === "unknown" ? "unknown"
    : formInvalid ? "validation"
    : status.kind === "retryable-error" ? "retryable"
    : null

  const feedback = resolveSaveFeedback(type, messages)
  if (!feedback) return null

  if (feedback.type === "blocked") {
    return {
      ...feedback,
      title: status.kind === "blocked" ? status.feedback.title : feedback.title,
      description: status.kind === "blocked"
        ? status.feedback.description || blockedMessage
        : feedback.description,
    }
  }

  if (feedback.type !== "unknown") return feedback

  if (!canInspect) {
    return {
      ...feedback,
      description: "入力内容は保持しています。保存結果が不明なため、自動で再送しません。入力内容を控えてからページを再読み込みしてください。",
    }
  }

  switch (inspection.kind) {
    case "matches":
      return {
        ...feedback,
        description: "現在のプロフィールは入力内容と一致しています。ただし、前回の保存が成功した証明ではありません。確認した場合は「確認完了」を選んでください。",
      }
    case "differs":
      return {
        ...feedback,
        description: `現在のニックネーム「${inspection.value}」と入力内容「${normalized}」が異なります。必要な場合だけ再保存するか、変更を破棄してください。`,
      }
    case "failed":
      return {
        ...feedback,
        description: "現在のプロフィールを取得できませんでした。保存を再送せず、状態の確認をやり直してください。",
      }
    default:
      return feedback
  }
}

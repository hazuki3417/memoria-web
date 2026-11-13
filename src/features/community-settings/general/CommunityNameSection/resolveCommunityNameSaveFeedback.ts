import { resolveSaveFeedback, type SaveFeedback, type SaveFeedbackMessages, type SaveFeedbackType } from "@/ui/save-feedback"
import { getCommunityBlockedFeedback } from "../../communityBlockedFeedback"
import type { useCommunityNameSettings } from "./useCommunityNameSettings"

type NameForm = ReturnType<typeof useCommunityNameSettings>
type FeedbackInput = Pick<NameForm, "status" | "formInvalid">

const messages = {
  validation: {
    title: "入力内容を確認してください",
    description: "入力内容を確認してください。",
  },
  retryable: {
    title: "Community名を保存できませんでした",
    description: "再試行してください。",
  },
  unknown: {
    title: "Community名の保存結果を確認できませんでした",
    description: "保存結果は不明です。自動で再送せず、現在の状態を確認してください。",
  },
  blocked: {
    title: "Community名を変更できません",
    description: "現在の状態を確認してください。",
  },
} satisfies SaveFeedbackMessages

/** 保存の意味的状態からFeedbackを1件解決する。Community固有の権限説明は維持する。 */
export const resolveCommunityNameSaveFeedback = ({
  status,
  formInvalid,
}: FeedbackInput): SaveFeedback | null => {
  const type: SaveFeedbackType | null =
    status.kind === "blocked" ? "blocked"
    : status.kind === "unknown" ? "unknown"
    : formInvalid ? "validation"
    : status.kind === "retryable-error" ? "retryable"
    : null

  const feedback = resolveSaveFeedback(type, messages)
  if (feedback?.type !== "blocked" || status.kind !== "blocked") return feedback
  return { ...feedback, ...getCommunityBlockedFeedback(status.error, "Community名") }
}

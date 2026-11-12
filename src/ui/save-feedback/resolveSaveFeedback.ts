/** 保存Feedbackの共通種別。Featureが保存結果をこの4種類へ対応付ける。 */
export type SaveFeedbackType = "validation" | "retryable" | "unknown" | "blocked"

/** 共通Resolverを利用するFeatureが、各種別に定義する文言の契約。 */
export type SaveFeedbackMessage = {
  title: string
  description: string
}

export type SaveFeedbackMessages<T extends SaveFeedbackType = SaveFeedbackType> =
  Record<T, SaveFeedbackMessage>

/** 1度に1件だけ表示する保存Feedbackの情報を提供する。 */
export type SaveFeedback = SaveFeedbackMessage & {
  type: SaveFeedbackType
  kind: "error" | "warning"
}

/** Featureの文言定義から、表示種別に対応する単一Feedbackを解決する。 */
export const resolveSaveFeedback = (
  type: SaveFeedbackType | null,
  messages: SaveFeedbackMessages,
): SaveFeedback | null => {
  if (type === null) return null
  return {
    type,
    kind: type === "unknown" ? "warning" : "error",
    ...messages[type],
  }
}

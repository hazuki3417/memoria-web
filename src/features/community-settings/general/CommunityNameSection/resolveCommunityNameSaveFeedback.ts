import type { SettingsSaveFailureKind } from "@/infrastructure/graphql/settingsMutationResult"

export type CommunityNameSaveFeedbackModel = {
  title: string
  description: string
  kind?: "error" | "warning"
} | null

export type CommunityNameInspection =
  | { status: "idle" | "checking" | "failed" }
  | { status: "matches" | "differs"; name: string }

/** Derives display feedback from the Form's save/recovery state without side effects. */
export function resolveCommunityNameSaveFeedback({
  formInvalid,
  failure,
  blockedFeedback,
  inspection,
  draft,
  hasInspector,
}: {
  formInvalid: boolean
  failure: SettingsSaveFailureKind | null
  blockedFeedback: { title: string; description: string } | null
  inspection: CommunityNameInspection
  draft: string
  hasInspector: boolean
}): CommunityNameSaveFeedbackModel {
  return formInvalid
    ? {
        kind: "error" as const,
        title: "入力内容を確認してください",
        description: "入力した値を受け付けられませんでした。内容を見直し、もう一度保存してください。",
      }
    : failure === "blocked"
      ? {
          kind: "error" as const,
          title: blockedFeedback?.title ?? "Community名を変更できません",
          description: blockedFeedback?.description ?? "画面を再読み込みして現在の状態を確認してください。",
        }
      : failure === "unknown"
        ? {
            kind: "warning" as const,
            title: "保存結果を確認できませんでした",
            description:
              inspection.status === "matches"
                ? "現在のCommunity名は入力内容と一致しています。元の保存処理が成功した証明ではありません。確認した場合は「確認完了」を選んでください。"
                : inspection.status === "differs"
                  ? `現在のCommunity名は「${inspection.name}」です。入力した「${draft.trim()}」とは異なります。必要な場合だけ再保存するか、変更を破棄してください。`
                  : inspection.status === "failed"
                    ? "現在のCommunity名を取得できませんでした。保存を再送せず、状態の確認をやり直してください。"
                    : hasInspector
                      ? "入力内容は保持しています。保存結果は未確定です。現在の状態を確認してから復旧操作を選んでください。"
                      : "入力内容は保持しています。保存結果は未確定です。入力内容を控えてから再読み込みしてください。",
          }
        : failure === "retryable"
          ? {
              kind: "error" as const,
              title: "保存できませんでした",
              description: "入力内容は保持されています。下の「保存」ボタンで再試行できます。",
            }
          : null

}

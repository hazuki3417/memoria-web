import type {
  ExplicitSaveFailureStatus,
  ExplicitSaveFeedbackModel,
} from "@/ui/ExplicitSave"
import type { useCommunityAliasForm } from "./useCommunityAliasForm"

type Inspection = ReturnType<typeof useCommunityAliasForm>["inspection"]

/** Derives Alias feedback without owning Form state or rendering controls. */
export function resolveCommunityAliasSaveFeedback({
  failure,
  formInvalid,
  blockedFeedback,
  inspection,
  normalized,
  hasInspector,
}: {
  failure: ExplicitSaveFailureStatus | null
  formInvalid: boolean
  blockedFeedback: { title: string; description: string } | null
  inspection: Inspection
  normalized: string
  hasInspector: boolean
}): ExplicitSaveFeedbackModel | null {
  if (!failure && !formInvalid) return null

  if (failure === "unknown") {
    let description: string

    if (inspection.status === "matches") {
      description =
        "現在のCommunity別名は入力内容と一致しています。元の保存処理が成功した証明ではありません。確認した場合は「確認完了」を選んでください。"
    } else if (inspection.status === "differs") {
      description = `現在のCommunity別名は「${inspection.alias ?? "設定なし"}」です。入力した「${normalized || "設定なし"}」とは異なります。必要な場合だけもう一度保存するか変更を破棄してください。`
    } else if (inspection.status === "failed") {
      description =
        "現在のCommunity別名を取得できませんでした。保存を再送せず、状態の確認をやり直してください。"
    } else {
      description = hasInspector
        ? "入力内容を保持しています。保存結果は未確定です。現在の状態を確認してから復旧操作を選んでください。"
        : "入力内容を保持しています。保存結果は未確定です。入力内容を控えてから再読み込みしてください。"
    }

    return {
      kind: "warning",
      title: "保存結果を確認できませんでした",
      description,
    }
  }

  if (failure === "blocked") {
    return {
      kind: "error",
      title: blockedFeedback?.title ?? "Community別名を変更できません",
      description:
        blockedFeedback?.description ??
        "入力内容を保持しています。権限とアカウントの状態を確認してください。",
    }
  }

  if (formInvalid) {
    return {
      kind: "error",
      title: "入力内容を確認してください",
      description:
        "入力した値を受け付けられませんでした。内容を見直して、もう一度保存してください。",
    }
  }

  return {
    kind: "error",
    title: "保存できませんでした",
    description: "入力内容を保持しています。再度保存してください。",
  }
}

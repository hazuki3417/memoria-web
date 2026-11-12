import type {
  ExplicitSaveFailureStatus,
  ExplicitSaveFeedbackModel,
  ExplicitSaveInspection,
} from "@/ui/ExplicitSave"

export type CommunityNameSaveFeedbackModel = ExplicitSaveFeedbackModel | null

export type CommunityNameInspection = ExplicitSaveInspection<string>

/** Derives Community name feedback from the Form's save/recovery state. */
export function resolveCommunityNameSaveFeedback({
  formInvalid,
  failure,
  blockedFeedback,
  inspection,
  draft,
  hasInspector,
}: {
  formInvalid: boolean
  failure: ExplicitSaveFailureStatus | null
  blockedFeedback: { title: string; description: string } | null
  inspection: CommunityNameInspection
  draft: string
  hasInspector: boolean
}): CommunityNameSaveFeedbackModel {
  if (formInvalid) {
    return {
      kind: "error",
      title: "入力内容を確認してください",
      description:
        "入力した値を受け付けられませんでした。内容を見直し、もう一度保存してください。",
    }
  }

  if (failure === "blocked") {
    return {
      kind: "error",
      title: blockedFeedback?.title ?? "Community名を変更できません",
      description:
        blockedFeedback?.description ??
        "画面を再読み込みして現在の状態を確認してください。",
    }
  }

  if (failure === "unknown") {
    let description: string

    if (inspection.status === "matches") {
      description =
        "現在のCommunity名は入力内容と一致しています。元の保存処理が成功した証明ではありません。確認した場合は「確認完了」を選んでください。"
    } else if (inspection.status === "differs") {
      description = `現在のCommunity名は「${inspection.value}」です。入力した「${draft.trim()}」とは異なります。必要な場合だけ再保存するか、変更を破棄してください。`
    } else if (inspection.status === "failed") {
      description =
        "現在のCommunity名を取得できませんでした。保存を再送せず、状態の確認をやり直してください。"
    } else {
      description = hasInspector
        ? "入力内容は保持しています。保存結果は未確定です。現在の状態を確認してから復旧操作を選んでください。"
        : "入力内容は保持しています。保存結果は未確定です。入力内容を控えてから再読み込みしてください。"
    }

    return {
      kind: "warning",
      title: "保存結果を確認できませんでした",
      description,
    }
  }

  if (failure === "retryable") {
    return {
      kind: "error",
      title: "保存できませんでした",
      description: "入力内容は保持されています。下の「保存」ボタンで再試行できます。",
    }
  }

  return null
}

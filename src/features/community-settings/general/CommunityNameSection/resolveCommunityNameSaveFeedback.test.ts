import { describe, expect, it } from "vitest"
import { resolveCommunityNameSaveFeedback, type CommunityNameInspection } from "./resolveCommunityNameSaveFeedback"
import type { SettingsSaveFailureKind } from "@/infrastructure/graphql/settingsMutationResult"

function feedback({
  failure = null,
  formInvalid = false,
  inspection = { status: "idle" },
  hasInspector = true,
  draft = "新しい名前",
  blockedFeedback = null,
}: {
  failure?: SettingsSaveFailureKind | null
  formInvalid?: boolean
  inspection?: CommunityNameInspection
  hasInspector?: boolean
  draft?: string
  blockedFeedback?: { title: string; description: string } | null
} = {}) {
  return resolveCommunityNameSaveFeedback({
    failure, formInvalid, inspection, hasInspector, draft, blockedFeedback,
  })
}

describe("Community名の保存・復旧Feedback", () => {
  it("正常状態ではFeedbackを表示しない", () => {
    expect(feedback()).toBeNull()
  })

  it("Form validationが他の保存失敗より優先される", () => {
    const result = feedback({ formInvalid: true, failure: "unknown" })
    expect(result?.title).toBe("入力内容を確認してください")
    expect(result?.kind).toBe("error")
  })

  it("Blockedでは既存の理由を保持し、未指定時は既定文言を使う", () => {
    expect(feedback({ failure: "blocked", blockedFeedback: {
      title: "変更できません", description: "利用権限がありません",
    } })).toMatchObject({ title: "変更できません", description: "利用権限がありません" })
    expect(feedback({ failure: "blocked" })?.title).toBe("Community名を変更できません")
  })

  it("結果不明の現在値確認・再保存判断を状態別に説明する", () => {
    expect(feedback({ failure: "unknown", inspection: { status: "matches", name: "新しい名前" } })?.description)
      .toContain("成功した証明ではありません")
    expect(feedback({ failure: "unknown", inspection: { status: "differs", name: "サーバー名" }, draft: "  新しい名前  " })?.description)
      .toContain("「サーバー名」")
    expect(feedback({ failure: "unknown", inspection: { status: "failed" } })?.description)
      .toContain("取得できませんでした")
    expect(feedback({ failure: "unknown" })?.description)
      .toContain("現在の状態を確認")
    expect(feedback({ failure: "unknown", hasInspector: false })?.description)
      .toContain("入力内容を控えて")
  })

  it("再試行可能な失敗では入力保持を案内する", () => {
    expect(feedback({ failure: "retryable" })?.description).toContain("入力内容は保持")
  })
})

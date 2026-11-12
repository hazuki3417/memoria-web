import { describe, expect, it } from "vitest"
import { resolveCommunityAliasSaveFeedback } from "./resolveCommunityAliasSaveFeedback"
import type { ExplicitSaveFailureStatus, ExplicitSaveInspection } from "@/ui/ExplicitSave"

function feedback({
  failure = null,
  formInvalid = false,
  inspection = { status: "idle" },
  hasInspector = true,
  normalized = "新しい別名",
  blockedFeedback = null,
}: {
  failure?: ExplicitSaveFailureStatus | null
  formInvalid?: boolean
  inspection?: ExplicitSaveInspection<string | null>
  hasInspector?: boolean
  normalized?: string
  blockedFeedback?: { title: string; description: string } | null
} = {}) {
  return resolveCommunityAliasSaveFeedback({
    failure, formInvalid, inspection, hasInspector, normalized, blockedFeedback,
  })
}

describe("Community別名の明示保存Feedback", () => {
  it("正常状態ではPanelを表示しない", () => {
    expect(feedback()).toBeNull()
  })

  it("FieldではなくForm全体のValidationを案内する", () => {
    expect(feedback({ formInvalid: true })).toEqual({
      kind: "error",
      title: "入力内容を確認してください",
      description:
        "入力した値を受け付けられませんでした。内容を見直して、もう一度保存してください。",
    })
  })

  it("Blocked時はFeatureが分類した理由をそのまま表示する", () => {
    expect(feedback({
      failure: "blocked",
      blockedFeedback: { title: "変更できません", description: "権限がありません" },
    })).toMatchObject({
      kind: "error",
      title: "変更できません",
      description: "権限がありません",
    })
    expect(feedback({ failure: "blocked" })?.title).toBe("Community別名を変更できません")
  })

  it("Unknown時は一致・不一致・照会失敗を区別し、nullを設定なしと表示する", () => {
    expect(feedback({ failure: "unknown", inspection: { status: "matches", value: "新しい別名" } }))
      .toMatchObject({ kind: "warning", title: "保存結果を確認できませんでした" })
    expect(feedback({ failure: "unknown", inspection: { status: "matches", value: "新しい別名" } })?.description)
      .toContain("成功した証明ではありません")
    expect(feedback({ failure: "unknown", inspection: { status: "differs", value: null } })?.description)
      .toContain("「設定なし」")
    expect(feedback({ failure: "unknown", inspection: { status: "failed" } })?.description)
      .toContain("取得できませんでした")
  })

  it("照会できないUnknownでは再読み込み前に入力を控える案内を維持する", () => {
    expect(feedback({ failure: "unknown", hasInspector: false })?.description)
      .toContain("入力内容を控えてから再読み込み")
  })

  it("保存結果のUnknownとForm Validationが競合した場合はUnknownを優先する", () => {
    expect(feedback({ failure: "unknown", formInvalid: true })?.kind).toBe("warning")
  })

  it("RetryableはDraftを保持した再試行を案内する", () => {
    expect(feedback({ failure: "retryable" })?.description).toBe(
      "入力内容を保持しています。再度保存してください。",
    )
  })
})

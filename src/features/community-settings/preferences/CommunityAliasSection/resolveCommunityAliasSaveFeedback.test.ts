import { describe, expect, it } from "vitest"
import { resolveCommunityAliasSaveFeedback } from "./resolveCommunityAliasSaveFeedback"

const base = { failure: null, formInvalid: false, blockedFeedback: null }

describe("Community別名の保存Feedback", () => {
  it("未保存状態ではFeedbackを表示しない", () => {
    expect(resolveCommunityAliasSaveFeedback(base)).toBeNull()
  })
  it("検証エラーでは入力内容を案内する", () => {
    expect(resolveCommunityAliasSaveFeedback({ ...base, formInvalid: true })?.type).toBe("validation")
  })
  it("結果不明は保存成功/失敗を断定せず再読み込みを案内する", () => {
    const result = resolveCommunityAliasSaveFeedback({ ...base, failure: "unknown", formInvalid: true })
    expect(result?.type).toBe("unknown")
    expect(result?.description).toContain("ページを再読み込みして")
  })
  it("BlockedはCommunity固有の理由を維持する", () => {
    expect(resolveCommunityAliasSaveFeedback({
      ...base, failure: "blocked",
      blockedFeedback: { title: "保存不可", description: "アカウントの削除処理中です" },
    })).toMatchObject({ type: "blocked", title: "保存不可" })
  })
  it("保存失敗はDraft保持を案内する", () => {
    const result = resolveCommunityAliasSaveFeedback({ ...base, failure: "retryable" })
    expect(result?.description).toContain("入力内容を保持")
  })
})

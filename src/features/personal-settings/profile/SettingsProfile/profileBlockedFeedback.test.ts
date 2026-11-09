import { describe, expect, it } from "vitest"
import { getProfileBlockedFeedback } from "./profileBlockedFeedback"

describe("getProfileBlockedFeedback", () => {
  it.each([
    ["UNAUTHENTICATED", "ログインが必要です"],
    ["USER_REGISTRATION_REQUIRED", "アカウント登録が必要です"],
    ["USER_DELETING", "アカウントの削除処理中です"],
    ["FORBIDDEN", "プロフィールを変更できません"],
    ["NOT_FOUND", "プロフィールを確認できません"],
  ])("maps public %s without exposing raw server messages", (code, title) => {
    const feedback = getProfileBlockedFeedback({
      graphQLErrors: [
        { extensions: { code }, message: "INTERNAL PRIVATE EXPLANATION" },
      ],
    })
    expect(feedback.title).toBe(title)
    expect(feedback.description).not.toContain("INTERNAL PRIVATE EXPLANATION")
  })

  it("does not invent a single cause from mixed or unrecognized codes", () => {
    const feedback = getProfileBlockedFeedback({
      errors: [
        { extensions: { code: "UNAUTHENTICATED" } },
        { extensions: { code: "FORBIDDEN" } },
      ],
    })
    expect(feedback.title).toBe("プロフィールを変更できません")
    expect(feedback.description).toContain("現在の状態")
    expect(
      getProfileBlockedFeedback({
        graphQLErrors: [{ extensions: { code: "UNKNOWN" } }],
      }).title,
    ).toBe("プロフィールを変更できません")
  })

  it("preserves a feature-provided fallback for legacy blocked errors", () => {
    expect(getProfileBlockedFeedback({ kind: "blocked" }, "特別な案内").description)
      .toBe("特別な案内")
  })
})

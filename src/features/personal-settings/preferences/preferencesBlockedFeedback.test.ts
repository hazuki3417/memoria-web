import { describe, expect, it } from "vitest"
import { getPreferencesBlockedFeedback } from "./preferencesBlockedFeedback"

describe("getPreferencesBlockedFeedback", () => {
  it.each([
    ["UNAUTHENTICATED", "ログインが必要です"],
    ["USER_REGISTRATION_REQUIRED", "アカウント登録が必要です"],
    ["USER_DELETING", "アカウントの削除処理中です"],
    ["FORBIDDEN", "設定を変更できません"],
    ["NOT_FOUND", "設定を確認できません"],
  ])("maps %s to an actionable public explanation", (code, title) => {
    const result = getPreferencesBlockedFeedback({
      graphQLErrors: [{ extensions: { code }, message: "private server message" }],
    })
    expect(result.title).toBe(title)
    expect(result.description).not.toContain("private server message")
  })
  it("uses generic guidance for mixed, unknown or missing codes", () => {
    const result = getPreferencesBlockedFeedback({
      errors: [
        { extensions: { code: "UNAUTHENTICATED" } },
        { extensions: { code: "FORBIDDEN" } },
      ],
    })
    expect(result.title).toBe("設定を変更できません")
    expect(getPreferencesBlockedFeedback(null).title).toBe("設定を変更できません")
  })
})

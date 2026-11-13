import { describe, expect, it } from "vitest"
import { getPersonalPreferencesBlockedFeedback } from "./personalPreferencesBlockedFeedback"

describe("getPersonalPreferencesBlockedFeedback", () => {
  it.each([
    ["UNAUTHENTICATED", "ログインが必要です"],
    ["USER_REGISTRATION_REQUIRED", "アカウント登録が必要です"],
    ["USER_DELETING", "アカウントの削除処理中です"],
    ["FORBIDDEN", "設定を変更できません"],
    ["NOT_FOUND", "設定を確認できません"],
  ])("maps %s to an actionable public explanation", (code, title) => {
    const result = getPersonalPreferencesBlockedFeedback({
      graphQLErrors: [{ extensions: { code }, message: "private server message" }],
    })
    expect(result.title).toBe(title)
    expect(result.description).not.toContain("private server message")
  })
  it("uses generic guidance for mixed, unknown or missing codes", () => {
    const result = getPersonalPreferencesBlockedFeedback({
      errors: [
        { extensions: { code: "UNAUTHENTICATED" } },
        { extensions: { code: "FORBIDDEN" } },
      ],
    })
    expect(result.title).toBe("設定を変更できません")
    expect(getPersonalPreferencesBlockedFeedback(null).title).toBe("設定を変更できません")
  })
})

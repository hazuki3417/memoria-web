import { describe, expect, it } from "vitest"
import { getCommunityBlockedFeedback } from "./communityBlockedFeedback"

describe("getCommunityBlockedFeedback", () => {
  it.each([
    ["UNAUTHENTICATED", "ログインが必要です"],
    ["USER_REGISTRATION_REQUIRED", "アカウント登録が必要です"],
    ["USER_DELETING", "アカウントの削除処理中です"],
    ["FORBIDDEN", "Community名を変更できません"],
    ["NOT_FOUND", "Community名を確認できません"],
  ])("uses safe copy for %s", (code, title) => {
    const result = getCommunityBlockedFeedback(
      { graphQLErrors: [{ extensions: { code }, message: "private" }] },
      "Community名",
    )
    expect(result.title).toBe(title)
    expect(result.description).not.toContain("private")
  })

  it("does not invent a cause from mixed or unknown codes", () => {
    expect(getCommunityBlockedFeedback({
      errors: [
        { extensions: { code: "FORBIDDEN" } },
        { extensions: { code: "NOT_FOUND" } },
      ],
    }, "Community別名").title).toBe("Community別名を変更できません")
    expect(getCommunityBlockedFeedback({
      graphQLErrors: [{ extensions: { code: "INTERNAL" } }],
    }, "Community設定").title).toBe("Community設定を変更できません")
  })
})

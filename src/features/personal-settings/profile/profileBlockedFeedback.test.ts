import { describe, expect, it } from "vitest"
import { getProfileBlockedFeedback } from "./profileBlockedFeedback"

describe("Profileの保存不可エラーに対応する案内", () => {
  it.each([
    ["UNAUTHENTICATED", "ログインが必要です"],
    ["USER_REGISTRATION_REQUIRED", "アカウント登録が必要です"],
    ["USER_DELETING", "アカウントの削除処理中です"],
    ["FORBIDDEN", "プロフィールを変更できません"],
    ["NOT_FOUND", "プロフィールを確認できません"],
  ])("公開コード%sに対応した安全な案内を返し、内部メッセージを公開しない", (code, title) => {
    const feedback = getProfileBlockedFeedback({
      graphQLErrors: [
        { extensions: { code }, message: "INTERNAL PRIVATE EXPLANATION" },
      ],
    })
    expect(feedback.title).toBe(title)
    expect(feedback.description).not.toContain("INTERNAL PRIVATE EXPLANATION")
  })

  it("エラーコードが混在・不明な場合は単一の原因を断定しない", () => {
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

  it("公開コードがない場合はFeatureが指定したFallbackを利用する", () => {
    expect(getProfileBlockedFeedback({ kind: "blocked" }, "特別な案内").description)
      .toBe("特別な案内")
  })
})

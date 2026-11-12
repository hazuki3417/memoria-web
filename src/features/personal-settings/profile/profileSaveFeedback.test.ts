import { describe, expect, it } from "vitest"
import { getProfileSaveFeedback } from "./profileSaveFeedback"

const base = {
  status: { kind: "idle" as const },
  formInvalid: false,
  blockedMessage: "画面を再読み込みしてください",
}

describe("Profile保存Feedbackの単一表示", () => {
  it("通常状態と保存中にはFeedbackを表示しない", () => {
    expect(getProfileSaveFeedback(base)).toBeNull()
    expect(getProfileSaveFeedback({ ...base, status: { kind: "saving" } })).toBeNull()
  })

  it("入力検証と再試行可能エラーが重なった場合は具体的な検証案内を1件だけ返す", () => {
    const feedback = getProfileSaveFeedback({
      ...base,
      status: { kind: "retryable-error" },
      formInvalid: true,
    })
    expect(feedback?.type).toBe("validation")
    expect(feedback?.kind).toBe("error")
  })

  it("検証エラーがない場合は再試行を案内する", () => {
    const feedback = getProfileSaveFeedback({
      ...base,
      status: { kind: "retryable-error" },
    })
    expect(feedback?.type).toBe("retryable")
    expect(feedback?.description).toBe("再試行してください。")
  })

  it("結果不明は入力エラーより優先し、自動再送を防ぐ説明を返す", () => {
    const feedback = getProfileSaveFeedback({
      ...base,
      status: { kind: "unknown" },
      formInvalid: true,
    })
    expect(feedback?.type).toBe("unknown")
    expect(feedback?.kind).toBe("warning")
    expect(feedback?.description).toBe("保存結果は不明です。自動で再送せず、現在の状態を確認してください。")
  })

  it("結果不明の案内は照会状態を引数にせず共通の説明を返す", () => {
    const feedback = getProfileSaveFeedback({ ...base, status: { kind: "unknown" } })
    expect(feedback?.description).not.toContain("現在のニックネーム")
    expect(feedback?.description).toContain("現在の状態を確認")
  })

  it.each([
    ["UNAUTHENTICATED", "ログインが必要です"],
    ["USER_REGISTRATION_REQUIRED", "アカウント登録が必要です"],
    ["USER_DELETING", "アカウントの削除処理中です"],
    ["FORBIDDEN", "プロフィールを変更できません"],
    ["NOT_FOUND", "プロフィールを確認できません"],
  ])("保存不可の公開コード%sには対応した安全な案内を返す", (code, title) => {
    const feedback = getProfileSaveFeedback({
      ...base,
      status: {
        kind: "blocked",
        error: {
          graphQLErrors: [{ extensions: { code }, message: "INTERNAL PRIVATE EXPLANATION" }],
        },
      },
    })
    expect(feedback?.type).toBe("blocked")
    expect(feedback?.title).toBe(title)
    expect(feedback?.description).not.toContain("INTERNAL PRIVATE EXPLANATION")
  })

  it("保存不可は入力検証より優先し、複数のFeedbackを返さない", () => {
    const feedback = getProfileSaveFeedback({
      ...base,
      formInvalid: true,
      status: { kind: "blocked", error: { graphQLErrors: [{ extensions: { code: "FORBIDDEN" } }] } },
    })
    expect(feedback?.type).toBe("blocked")
  })

  it("公開エラーコードが混在・不明な場合は単一原因を断定しない", () => {
    const feedback = getProfileSaveFeedback({
      ...base,
      status: {
        kind: "blocked",
        error: {
          errors: [
            { extensions: { code: "UNAUTHENTICATED" } },
            { extensions: { code: "FORBIDDEN" } },
          ],
        },
      },
    })
    expect(feedback?.title).toBe("プロフィールを変更できません")
    expect(feedback?.description).toBe("画面を再読み込みしてください")
    expect(getProfileSaveFeedback({
      ...base,
      status: { kind: "blocked", error: { graphQLErrors: [{ extensions: { code: "UNKNOWN" } }] } },
    })?.title).toBe("プロフィールを変更できません")
  })

  it("公開エラーコードがない場合はFeatureのFallbackを利用する", () => {
    const feedback = getProfileSaveFeedback({
      ...base,
      status: { kind: "blocked", error: null },
    })
    expect(feedback).toEqual({
      type: "blocked",
      kind: "error",
      title: "プロフィールを変更できません",
      description: "画面を再読み込みしてください",
    })
  })
})

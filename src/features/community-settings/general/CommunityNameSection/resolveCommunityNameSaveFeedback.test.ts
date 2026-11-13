import { describe, expect, it } from "vitest"
import { resolveCommunityNameSaveFeedback } from "./resolveCommunityNameSaveFeedback"

const base = {
  status: { kind: "idle" as const },
  formInvalid: false,
}

describe("Community名の保存Feedback", () => {
  it("通常状態と保存中にはFeedbackを表示しない", () => {
    expect(resolveCommunityNameSaveFeedback(base)).toBeNull()
    expect(resolveCommunityNameSaveFeedback({
      ...base, status: { kind: "saving" },
    })).toBeNull()
  })

  it("検証エラーは再試行可能エラーより優先する", () => {
    const result = resolveCommunityNameSaveFeedback({
      status: { kind: "retryable-error" },
      formInvalid: true,
    })
    expect(result?.type).toBe("validation")
    expect(result?.kind).toBe("error")
  })

  it("再試行可能な失敗を案内する", () => {
    const result = resolveCommunityNameSaveFeedback({
      ...base, status: { kind: "retryable-error" },
    })
    expect(result?.type).toBe("retryable")
    expect(result?.description).toBe("再試行してください。")
  })

  it("Unknownは入力エラーより優先し、自動再送を要求しない", () => {
    const result = resolveCommunityNameSaveFeedback({
      status: { kind: "unknown" },
      formInvalid: true,
    })
    expect(result?.type).toBe("unknown")
    expect(result?.description).toContain("自動で再送せず")
  })

  it("BlockedはCommunity固有の公開エラー理由を表示する", () => {
    const result = resolveCommunityNameSaveFeedback({
      status: {
        kind: "blocked",
        error: { graphQLErrors: [{ extensions: { code: "FORBIDDEN" } }] },
      },
      formInvalid: true,
    })
    expect(result?.type).toBe("blocked")
    expect(result?.title).toBe("Community名を変更できません")
    expect(result?.description).toContain("権限")
  })

  it("未知のBlocked原因は安全な案内へフォールバックする", () => {
    const result = resolveCommunityNameSaveFeedback({
      ...base, status: { kind: "blocked", error: null },
    })
    expect(result?.type).toBe("blocked")
    expect(result?.description).not.toContain("undefined")
  })
})

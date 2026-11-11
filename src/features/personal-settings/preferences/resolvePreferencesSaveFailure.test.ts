import { describe, expect, it } from "vitest"
import { SettingsInputValidationError } from "@/infrastructure/graphql/settingsMutationResult"
import { resolvePreferencesSaveFailure } from "./resolvePreferencesSaveFailure"

describe("Preferences保存Actionの外部失敗分類", () => {
  it("Typed Field ValidationのInput Pathを保持する", () => {
    const violations = [
      { scope: "FIELD", code: "INVALID_VALUE", inputPaths: [{ segments: ["fileSizeUnit"] }] },
    ]
    expect(resolvePreferencesSaveFailure(new SettingsInputValidationError(violations))).toEqual({
      status: "validation",
      violations,
    })
  })

  it("Blocked理由を公開Error Codeから判断し、Server Messageを出さない", () => {
    const result = resolvePreferencesSaveFailure({
      graphQLErrors: [{ extensions: { code: "USER_DELETING" }, message: "private" }],
    })
    expect(result).toMatchObject({
      status: "blocked",
      feedback: { title: "アカウントの削除処理中です" },
    })
    if (result.status !== "blocked") throw new Error("Expected blocked")
    expect(result.feedback?.description).not.toContain("private")
  })

  it("明示的な一時失敗だけをRetryableとし、通信断はUnknown", () => {
    expect(resolvePreferencesSaveFailure({ kind: "retryable" })).toEqual({ status: "retryable" })
    expect(resolvePreferencesSaveFailure(new Error("timeout"))).toEqual({ status: "unknown" })
  })
})

import { describe, expect, it } from "vitest"
import { SettingsInputValidationError } from "@/infrastructure/graphql/settingsMutationResult"
import { resolvePreferencesAutoSaveFailure } from "./resolvePreferencesAutoSaveFailure"

describe("Personal Preferencesの自動保存Action失敗分類", () => {
  it("Typed Field ValidationのInput Pathを保持する", () => {
    const violations = [
      { scope: "FIELD", code: "INVALID_VALUE", inputPaths: [{ segments: ["fileSizeUnit"] }] },
    ]
    expect(resolvePreferencesAutoSaveFailure(new SettingsInputValidationError(violations))).toEqual({
      kind: "validation",
      violations,
    })
  })

  it("Blocked理由を公開Error Codeから判断し、Server Messageを出さない", () => {
    const result = resolvePreferencesAutoSaveFailure({
      graphQLErrors: [{ extensions: { code: "USER_DELETING" }, message: "private" }],
    })
    expect(result).toMatchObject({
      kind: "blocked",
      feedback: { title: "アカウントの削除処理中です" },
    })
    if (result.kind !== "blocked") throw new Error("Expected blocked")
    expect(result.feedback.description).not.toContain("private")
  })

  it("明示的な一時失敗だけをRetryableとし、通信断はUnknown", () => {
    expect(resolvePreferencesAutoSaveFailure({ kind: "retryable" })).toEqual({ kind: "retryable" })
    expect(resolvePreferencesAutoSaveFailure(new Error("timeout"))).toEqual({ kind: "unknown" })
  })
})

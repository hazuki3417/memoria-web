import { describe, expect, it } from "vitest"
import { AutoSaveActionError, getAutoSaveFailure } from "./autoSaveFailure"

describe("自動保存の失敗Contract", () => {
  it("Actionが分類した結果を保持する", () => {
    const error = new AutoSaveActionError({
      kind: "blocked",
      feedback: { title: "保存できません", description: "権限を確認してください" },
    })
    expect(getAutoSaveFailure(error)).toEqual({
      kind: "blocked",
      feedback: { title: "保存できません", description: "権限を確認してください" },
    })
  })

  it("分類されていない例外を安全なUnknownとして扱う", () => {
    expect(getAutoSaveFailure(new Error("connection lost"))).toEqual({ kind: "unknown" })
    expect(getAutoSaveFailure({ kind: "retryable" })).toEqual({ kind: "unknown" })
    expect(getAutoSaveFailure({ graphQLErrors: [{ extensions: { code: "FORBIDDEN" } }] })).toEqual({
      kind: "unknown",
    })
  })
})

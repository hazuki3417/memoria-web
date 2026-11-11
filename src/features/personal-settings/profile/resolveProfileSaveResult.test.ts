import { describe, expect, it } from "vitest"
import { SettingsInputValidationError } from "@/infrastructure/graphql/settingsMutationResult"
import { resolveProfileSaveResult } from "./resolveProfileSaveResult"

describe("Profile明示保存Actionの結果", () => {
  it("Serverで確定したニックネームを返す", async () => {
    await expect(resolveProfileSaveResult(async () => "サーバーで確定した名前")).resolves.toEqual({
      status: "confirmed",
      value: "サーバーで確定した名前",
    })
  })

  it("型付き入力ErrorはField Pathを失わない", async () => {
    const violations = [
      { scope: "FIELD", code: "REQUIRED", inputPaths: [{ segments: ["nickname"] }] },
    ]
    const result = await resolveProfileSaveResult(async () => {
      throw new SettingsInputValidationError(violations)
    })
    expect(result).toEqual({ status: "validation", violations })
  })

  it("公開された操作不可理由を安全な説明へ変換する", async () => {
    const result = await resolveProfileSaveResult(async () => {
      throw { graphQLErrors: [{ extensions: { code: "USER_DELETING" } }] }
    })
    expect(result).toMatchObject({
      status: "blocked",
      feedback: { title: "アカウントの削除処理中です" },
    })
  })

  it("明示された一時失敗と未確定な通信失敗を区別する", async () => {
    await expect(resolveProfileSaveResult(async () => {
      throw { kind: "retryable" }
    })).resolves.toEqual({ status: "retryable" })
    await expect(resolveProfileSaveResult(async () => {
      throw new Error("timeout")
    })).resolves.toEqual({ status: "unknown" })
  })
})

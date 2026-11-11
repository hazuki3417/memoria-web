import { describe, expect, it } from "vitest"
import { SettingsInputValidationError } from "@/infrastructure/graphql/settingsMutationResult"
import { resolveCommunityAliasSaveResult } from "./resolveCommunityAliasSaveResult"

describe("Community別名の明示保存Action結果", () => {
  it("別名解除ではnullを確認済み値として返す", async () => {
    await expect(resolveCommunityAliasSaveResult(null, async () => undefined)).resolves.toEqual({
      status: "confirmed",
      value: null,
    })
  })

  it("Typed ValidationのField Pathを保持する", async () => {
    const violations = [
      { scope: "FIELD", code: "TOO_LONG", inputPaths: [{ segments: ["alias"] }] },
    ]
    await expect(resolveCommunityAliasSaveResult("別名", async () => {
      throw new SettingsInputValidationError(violations)
    })).resolves.toEqual({ status: "validation", violations })
  })

  it("権限Errorと結果不明を区別する", async () => {
    await expect(resolveCommunityAliasSaveResult("別名", async () => {
      throw { graphQLErrors: [{ extensions: { code: "USER_DELETING" } }] }
    })).resolves.toMatchObject({
      status: "blocked",
      feedback: { title: "アカウントの削除処理中です" },
    })
    await expect(resolveCommunityAliasSaveResult("別名", async () => {
      throw new Error("lost response")
    })).resolves.toEqual({ status: "unknown" })
  })
})

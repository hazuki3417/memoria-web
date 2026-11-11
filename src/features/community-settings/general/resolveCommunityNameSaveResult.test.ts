import { describe, expect, it } from "vitest"
import { SettingsInputValidationError } from "@/infrastructure/graphql/settingsMutationResult"
import { resolveCommunityNameSaveResult } from "./resolveCommunityNameSaveResult"

describe("Community名の明示保存Action結果", () => {
  it("送信値ではなくServerで確定したCommunity名を返す", async () => {
    await expect(resolveCommunityNameSaveResult(async () => "正規化済みの名前")).resolves.toEqual({
      status: "confirmed",
      value: "正規化済みの名前",
    })
  })

  it("型付き拒否のField PathをFormへ引き渡す", async () => {
    const violations = [
      { scope: "FIELD", code: "REQUIRED", inputPaths: [{ segments: ["name"] }] },
    ]
    await expect(resolveCommunityNameSaveResult(async () => {
      throw new SettingsInputValidationError(violations)
    })).resolves.toEqual({ status: "validation", violations })
  })

  it("権限不足をBlockedとして返す", async () => {
    await expect(resolveCommunityNameSaveResult(async () => {
      throw { graphQLErrors: [{ extensions: { code: "FORBIDDEN" } }] }
    })).resolves.toMatchObject({
      status: "blocked",
      feedback: { title: "Community名を変更できません" },
    })
  })

  it("結果を確認できない通信失敗をUnknownとして返す", async () => {
    await expect(resolveCommunityNameSaveResult(async () => {
      throw new Error("timeout")
    })).resolves.toEqual({ status: "unknown" })
  })
})

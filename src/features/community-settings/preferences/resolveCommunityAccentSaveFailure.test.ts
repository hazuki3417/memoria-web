import { describe, expect, it } from "vitest"
import { SettingsInputValidationError } from "@/infrastructure/graphql/settingsMutationResult"
import { resolveCommunityAccentSaveFailure } from "./resolveCommunityAccentSaveFailure"

describe("Community Accent保存Actionの外部失敗分類", () => {
  it("入力拒否のField Pathを保持する", () => {
    const violations = [
      { scope: "FIELD", code: "INVALID_FORMAT", inputPaths: [{ segments: ["accentColor"] }] },
    ]
    expect(resolveCommunityAccentSaveFailure(new SettingsInputValidationError(violations))).toEqual({
      status: "validation",
      violations,
    })
  })

  it("公開された操作不可ErrorをBlockedとして返す", () => {
    expect(resolveCommunityAccentSaveFailure({
      graphQLErrors: [{ extensions: { code: "FORBIDDEN" } }],
    })).toMatchObject({
      status: "blocked",
      feedback: { title: "Community設定を変更できません" },
    })
  })

  it("混在したGraphQL Errorと結果欠落はUnknownとして再送を促さない", () => {
    const error = {
      graphQLErrors: [
        { extensions: { code: "FORBIDDEN" } },
        { extensions: { code: "INTERNAL_SERVER_ERROR" } },
      ],
    }
    expect(resolveCommunityAccentSaveFailure(error)).toEqual({ status: "unknown" })
    expect(resolveCommunityAccentSaveFailure(new Error("timeout"))).toEqual({ status: "unknown" })
  })
})

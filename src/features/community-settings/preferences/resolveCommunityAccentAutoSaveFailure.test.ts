import { describe, expect, it } from "vitest"
import { SettingsInputValidationError } from "@/infrastructure/graphql/settingsMutationResult"
import { resolveCommunityAccentAutoSaveFailure } from "./resolveCommunityAccentAutoSaveFailure"

describe("Community Accentの自動保存Action失敗分類", () => {
  it("入力拒否のField Pathを保持する", () => {
    const violations = [
      { scope: "FIELD", code: "INVALID_FORMAT", inputPaths: [{ segments: ["accentColor"] }] },
    ]
    expect(resolveCommunityAccentAutoSaveFailure(new SettingsInputValidationError(violations))).toEqual({
      kind: "validation",
      violations,
    })
  })

  it("公開された操作不可ErrorをBlockedとして返す", () => {
    expect(resolveCommunityAccentAutoSaveFailure({
      graphQLErrors: [{ extensions: { code: "FORBIDDEN" } }],
    })).toMatchObject({
      kind: "blocked",
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
    expect(resolveCommunityAccentAutoSaveFailure(error)).toEqual({ kind: "unknown" })
    expect(resolveCommunityAccentAutoSaveFailure(new Error("timeout"))).toEqual({ kind: "unknown" })
  })
})

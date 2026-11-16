import { describe, expect, it } from "vitest"
import type { OperationUpdateCommunitySettingsMutation } from "@/infrastructure/graphql/generated"
import { classifyCommunityPreferencesMutationResult } from "./classifyCommunityPreferencesMutationResult"

type MutationResult = NonNullable<OperationUpdateCommunitySettingsMutation["updateCommunitySettings"]>

describe("Community PreferencesのTyped Mutation結果", () => {
  it("Typed Successを正規化した自動保存対象の確定値として返す", () => {
    const result: MutationResult = {
      __typename: "UpdateCommunitySettingsSuccess",
      settings: { accentColor: "#aabbcc", alias: "変更対象外の別名" },
    }
    expect(classifyCommunityPreferencesMutationResult(result)).toEqual({
      kind: "success",
      value: { accentColor: "#AABBCC" },
    })
  })

  it("不正な確定色はUnknownとして返す", () => {
    const result: MutationResult = {
      __typename: "UpdateCommunitySettingsSuccess",
      settings: { accentColor: "#123", alias: null },
    }
    expect(classifyCommunityPreferencesMutationResult(result)).toEqual({ kind: "unknown" })
  })

  it("入力拒否はField Path付きのRejectedとして返す", () => {
    const result: MutationResult = {
      __typename: "InputValidationFailure",
      violations: [
        { scope: "FIELD", code: "INVALID_FORMAT", inputPaths: [{ segments: ["accentColor"] }] },
      ],
    }
    expect(classifyCommunityPreferencesMutationResult(result)).toMatchObject({
      kind: "rejected",
      reason: {
        kind: "validation",
        violations: [{ code: "INVALID_FORMAT", inputPaths: [{ segments: ["accentColor"] }] }],
      },
    })
  })
})

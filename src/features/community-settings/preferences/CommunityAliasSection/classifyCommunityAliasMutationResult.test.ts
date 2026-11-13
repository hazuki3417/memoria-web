import { describe, expect, it } from "vitest"
import type { OperationUpdateCommunitySettingsMutation } from "@/infrastructure/graphql/generated"
import { classifyCommunityAliasMutationResult } from "./classifyCommunityAliasMutationResult"

type Result = OperationUpdateCommunitySettingsMutation["updateCommunitySettings"]
const success = (alias: string | null): Result => ({
  __typename: "UpdateCommunitySettingsSuccess",
  settings: { alias, accentColor: "#AABBCC" },
})

describe("Community別名のMutation結果分類", () => {
  it("一致するAliasの更新成功を確定値として返す", () => {
    expect(classifyCommunityAliasMutationResult(success("新しい別名"), "新しい別名"))
      .toEqual({ kind: "success", value: "新しい別名" })
  })
  it("別名解除のnullを欠損と誤認せず成功として返す", () => {
    expect(classifyCommunityAliasMutationResult(success(null), null))
      .toEqual({ kind: "success", value: null })
  })
  it("返却されたAliasが要求値と異なる場合は確定成功と扱わない", () => {
    expect(classifyCommunityAliasMutationResult(success("古い別名"), "新しい別名"))
      .toEqual({ kind: "unknown" })
  })
  it("Typed InputValidationFailureを拒否として返す", () => {
    const result: Result = {
      __typename: "InputValidationFailure",
      violations: [{ scope: "FIELD", code: "TOO_LONG", inputPaths: [{ segments: ["alias"] }] }],
    }
    expect(classifyCommunityAliasMutationResult(result, "別名")).toMatchObject({
      kind: "rejected",
      reason: { kind: "validation", violations: [{ code: "TOO_LONG" }] },
    })
  })
})

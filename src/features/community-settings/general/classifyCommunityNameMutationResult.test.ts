import { describe, expect, it } from "vitest"
import type { OperationUpdateCommunityMutation } from "@/infrastructure/graphql/generated"
import { classifyCommunityNameMutationResult } from "./classifyCommunityNameMutationResult"

type Result = OperationUpdateCommunityMutation["updateCommunity"]

describe("Community名のTyped Mutation結果", () => {
  it("確定済みSuccessのCommunity名を返す", () => {
    const result = {
      __typename: "UpdateCommunitySuccess",
      community: {
        id: "community-a",
        name: "確定したCommunity名",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      },
    } satisfies Result
    expect(classifyCommunityNameMutationResult(result)).toEqual({
      kind: "success", value: "確定したCommunity名",
    })
  })

  it("入力検証失敗を未成立の拒否として返す", () => {
    const result = {
      __typename: "InputValidationFailure",
      violations: [],
    } satisfies Result
    expect(classifyCommunityNameMutationResult(result)).toEqual({
      kind: "rejected",
      reason: { kind: "validation", violations: result.violations },
    })
  })
})

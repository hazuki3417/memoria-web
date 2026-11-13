import { describe, expect, it } from "vitest"
import type { OperationSaveUserPreferencesMutation } from "@/infrastructure/graphql/generated"
import { defaultUserPreferences } from "../userPreferences"
import { classifyPersonalPreferencesMutationResult } from "./classifyPersonalPreferencesMutationResult"

type MutationResult = OperationSaveUserPreferencesMutation["updateUserPreferences"]

describe("Personal PreferencesのTyped Mutation結果", () => {
  it("Typed Successを確定値として返す", () => {
    const result: MutationResult = {
      __typename: "UpdateUserPreferencesSuccess",
      preferences: { ...defaultUserPreferences },
    }
    expect(classifyPersonalPreferencesMutationResult(result)).toEqual({
      kind: "success",
      value: defaultUserPreferences,
    })
  })

  it("入力拒否はField Path付きのRejectedとして返す", () => {
    const result: MutationResult = {
      __typename: "InputValidationFailure",
      violations: [
        { scope: "FIELD", code: "INVALID_FORMAT", inputPaths: [{ segments: ["personalAccentColor"] }] },
      ],
    }
    expect(classifyPersonalPreferencesMutationResult(result)).toMatchObject({
      kind: "rejected",
      reason: {
        kind: "validation",
        violations: [{ code: "INVALID_FORMAT", inputPaths: [{ segments: ["personalAccentColor"] }] }],
      },
    })
  })
})

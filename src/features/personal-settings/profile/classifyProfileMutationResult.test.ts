import { describe, expect, it } from "vitest"
import type { OperationUpdateMemoriaUserProfileMutation } from "@/infrastructure/graphql/generated"
import { classifyProfileMutationResult } from "./classifyProfileMutationResult"

type ProfileMutationResult = OperationUpdateMemoriaUserProfileMutation["updateUserProfile"]

describe("ProfileのGraphQL更新結果の分類", () => {
  it("成功したMutationから確定したNicknameを取り出す", () => {
    const result = {
      __typename: "UpdateUserProfileSuccess",
      user: { id: "user-a", profile: { nickname: "更新後の名前" } },
    } satisfies ProfileMutationResult

    expect(classifyProfileMutationResult(result)).toEqual({
      kind: "success",
      value: "更新後の名前",
    })
  })

  it("入力検証エラーを拒否として分類し、違反情報を保持する", () => {
    const result = {
      __typename: "InputValidationFailure",
      violations: [],
    } satisfies ProfileMutationResult

    expect(classifyProfileMutationResult(result)).toEqual({
      kind: "rejected",
      reason: { kind: "validation", violations: [] },
    })
  })
})

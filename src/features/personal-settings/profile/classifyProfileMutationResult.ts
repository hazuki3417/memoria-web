import type { OperationUpdateMemoriaUserProfileMutation } from "@/infrastructure/graphql/generated"
import type { ActionOutcome } from "@/ui/Action"
import type { ProfileSaveRejection } from "./profileSaveOutcome"

type ProfileMutationResult = OperationUpdateMemoriaUserProfileMutation["updateUserProfile"]

/** GraphQLのProfile更新結果を分類し、保存成立または入力検証による拒否を画面へ提供する。 */
export const classifyProfileMutationResult = (
  result: ProfileMutationResult,
): ActionOutcome<string, ProfileSaveRejection> => {
  switch (result.__typename) {
    case "UpdateUserProfileSuccess":
      return { kind: "success", value: result.user.profile.nickname }

    case "InputValidationFailure":
      return {
        kind: "rejected",
        reason: { kind: "validation", violations: result.violations },
      }

    default:
      // OperationのUnionに種類が増えた場合は、未対応の分類を型検査で検出する。
      return result satisfies never
  }
}

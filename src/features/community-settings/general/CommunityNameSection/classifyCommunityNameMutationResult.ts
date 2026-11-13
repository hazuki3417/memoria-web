import type { OperationUpdateCommunityMutation } from "@/infrastructure/graphql/generated"
import type { ActionOutcome } from "@/ui/Action"
import type { CommunityNameSaveRejection } from "./communityNameSaveOutcome"

type MutationResult = NonNullable<OperationUpdateCommunityMutation["updateCommunity"]>

/** Community名更新のTyped Resultだけを確実な成功・入力拒否に分類する。 */
export const classifyCommunityNameMutationResult = (
  result: MutationResult,
): ActionOutcome<string, CommunityNameSaveRejection> => {
  switch (result.__typename) {
    case "UpdateCommunitySuccess":
      return { kind: "success", value: result.community.name }
    case "InputValidationFailure":
      return {
        kind: "rejected",
        reason: { kind: "validation", violations: result.violations },
      }
    default:
      return result satisfies never
  }
}

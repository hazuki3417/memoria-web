import type { OperationUpdateCommunitySettingsMutation } from "@/infrastructure/graphql/generated"
import type { ActionOutcome } from "@/ui/Action"
import type { CommunityAliasSaveRejection } from "./communityAliasSaveOutcome"

type MutationResult = NonNullable<OperationUpdateCommunitySettingsMutation["updateCommunitySettings"]>

/** UpdateCommunitySettingsのTyped Resultを、Aliasの確定値と入力拒否に分類する。 */
export const classifyCommunityAliasMutationResult = (
  result: MutationResult,
  input: string | null,
): ActionOutcome<string | null, CommunityAliasSaveRejection> => {
  switch (result.__typename) {
    case "UpdateCommunitySettingsSuccess":
      // 同じMutationをAccentも利用するため、Aliasの確定応答を確認する。
      return result.settings.alias === input
        ? { kind: "success", value: result.settings.alias }
        : { kind: "unknown" }
    case "InputValidationFailure":
      return { kind: "rejected", reason: { kind: "validation", violations: result.violations } }
    default:
      return result satisfies never
  }
}

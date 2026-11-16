import type { OperationUpdateCommunitySettingsMutation } from "@/infrastructure/graphql/generated"
import { isCommunityAccentColor } from "./communityPreferences"
import { fromGraphqlCommunityPreferences } from "./communityPreferencesGraphqlAdapter"
import type { CommunityPreferencesSaveOutcome } from "./communityPreferencesSaveOutcome"

type MutationResult = NonNullable<OperationUpdateCommunitySettingsMutation["updateCommunitySettings"]>

/** MutationのTyped ResultだけからPreferences保存の確実性を判定する。 */
export const classifyCommunityPreferencesMutationResult = (
  result: MutationResult,
): CommunityPreferencesSaveOutcome => {
  switch (result.__typename) {
    case "UpdateCommunitySettingsSuccess": {
      const { accentColor: color } = fromGraphqlCommunityPreferences(result.settings)
      if (!color || !isCommunityAccentColor(color)) return { kind: "unknown" }
      return { kind: "success", value: { accentColor: color.toUpperCase() } }
    }
    case "InputValidationFailure":
      return {
        kind: "rejected",
        reason: { kind: "validation", violations: result.violations },
      }
    default:
      return { kind: "unknown" }
  }
}
